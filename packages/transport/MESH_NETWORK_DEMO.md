# Mesh Network Demo

This document provides instructions for running and testing the mesh network implementation.

## Setup

First, make sure all dependencies are installed:

```bash
npm install
```

Then build the transport package:

```bash
cd packages/transport
npm run build
```

## Running the Mesh Network Demo

You can run multiple instances of the mesh network node to test peer-to-peer communication. Open separate terminal windows and run the following commands:

### Terminal 1 - Node 1

```bash
cd packages/transport
npm run start-mesh 44301 127.0.0.1
```

### Terminal 2 - Node 2

```bash
cd packages/transport
npm run start-mesh 44302 127.0.0.1
```

### Terminal 3 - Node 3

```bash
cd packages/transport
npm run start-mesh 44303 127.0.0.1
```

## Demo Commands

Once the nodes are running, you can interact with them using the following commands:

1. **List Connected Peers**

   ```
   peers
   ```

   This will display a list of all peers that the current node is connected to.

2. **View Routing Table**

   ```
   routes
   ```

   This shows the current routing table, including destinations, next hops, and distances.

3. **Send a Message to a Peer**

   ```
   send <peer_id> Hello from Node 1!
   ```

   Replace `<peer_id>` with the ID of the target peer (shown in the `peers` command output).
   You can also use the node name (e.g., `Node-44302`) instead of the ID.

4. **Broadcast a Message to All Peers**

   ```
   broadcast Hello everyone!
   ```

   This sends the message to all connected peers.

5. **Exit the Application**

   ```
   exit
   ```

   This properly shuts down the node and exits the application.

## Testing Network Resilience

To test network resilience and routing capabilities:

1. Start all three nodes as described above
2. Wait for them to discover each other (check with `peers` command)
3. Send messages between Node 1 and Node 3
4. Stop Node 2 (using the `exit` command)
5. Watch as the routing tables update
6. Try sending messages again - they should still be delivered via alternative routes

## Running the Tests

To run the automated tests for the mesh network:

```bash
cd packages/transport
npm test
```

This will execute the Jest tests that simulate a small network of peers and verify functionality.

## Troubleshooting

If peers cannot discover each other:

1. Ensure all nodes are running on the same network
2. Check that no firewall is blocking UDP port 44201 (used for discovery)
3. Verify that the WebSocket ports (44301, 44302, etc.) are not blocked
4. If running on different machines, ensure broadcast traffic is allowed

If a node crashes, examine the error output and check:

1. Port conflicts - ensure each node uses a unique port
2. Network connectivity issues
3. Resource limitations (if running many nodes) 