class RulesEngine:
    def __init__(self):
        # We can eventually load these from rules_config.yaml
        self.rules = [
            self._rule_high_amount,
            self._rule_new_device_high_amount,
            self._rule_velocity
        ]

    def evaluate(self, transaction: dict) -> dict:
        """
        Evaluate rules against a transaction.
        Returns a dict with 'decision' and 'reasons'.
        Decision can be None (pass), 'BLOCK', or 'MFA'.
        """
        reasons = []
        decision = None

        for rule in self.rules:
            res, reason = rule(transaction)
            if res:
                if res == 'BLOCK':
                    decision = 'BLOCK'
                elif res == 'MFA' and decision != 'BLOCK':
                    decision = 'MFA'
                reasons.append(reason)

        return {
            "decision": decision,
            "reasons": reasons
        }

    def _rule_high_amount(self, tx: dict):
        # Hard block only on extreme amounts — let ML model handle the rest
        amount = tx.get('amount', 0)
        if amount > 500000:
            return 'BLOCK', f"Amount {amount} exceeds hard limit"
        return None, None

    def _rule_new_device_high_amount(self, tx: dict):
        # Only flag truly unknown device + very large amount
        device_id = tx.get('device_id')
        amount = tx.get('amount', 0)
        if not device_id and amount > 100000:
            return 'MFA', "Very high amount from completely unknown device"
        return None, None

    def _rule_velocity(self, tx: dict):
        # Imagine this checks a Redis feature store for transaction counts in last 1h
        # For now, it's a stub
        velocity = tx.get('metadata', {}).get('txn_count_1h', 0)
        if velocity > 10:
            return 'BLOCK', "High velocity: >10 transactions in 1 hour"
        return None, None

rule_engine_instance = RulesEngine()

def run_rules(transaction: dict):
    return rule_engine_instance.evaluate(transaction)
