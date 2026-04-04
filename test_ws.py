import asyncio
import websockets

async def _test_ws():
    uri = "ws://localhost:8000/api/v1/stream"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for message...")
            msg = await asyncio.wait_for(websocket.recv(), timeout=2.0)
            print(f"Received msg: {msg}")
    except Exception as e:
        print(f"Error: {e}")

def test_ws():
    asyncio.run(_test_ws())


if __name__ == "__main__":
    asyncio.run(_test_ws())
