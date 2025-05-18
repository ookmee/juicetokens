# JuiceTokens Troubleshooting Guide

This document provides solutions for common issues that may arise when using the JuiceTokens system.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Docker Environment Issues](#docker-environment-issues)
3. [Token Creation Problems](#token-creation-problems)
4. [Transport Layer Issues](#transport-layer-issues)
5. [Transaction Failures](#transaction-failures)
6. [Trust Verification Problems](#trust-verification-problems)
7. [Performance Issues](#performance-issues)
8. [Monitoring and Metrics](#monitoring-and-metrics)
9. [Common Error Messages](#common-error-messages)

## Installation Issues

### Missing Dependencies

**Problem:** Installation fails with dependency errors.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Ensure node version matches requirements
node -v  # Should be v16 or higher

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Build Failures

**Problem:** Build fails with TypeScript errors.

**Solution:**
```bash
# Ensure TypeScript is installed
npm install -g typescript

# Check TSConfig
cat tsconfig.json

# Build in verbose mode
npm run build:ts -- --verbose
```

### Protocol Buffer Issues

**Problem:** Protocol buffer generation fails.

**Solution:**
```bash
# Ensure protobufjs-cli is installed
npm install -g protobufjs-cli

# Manually compile protos
pbjs -t static-module -w commonjs -o dist/protos.js protos/**/*.proto
pbts -o dist/protos.d.ts dist/protos.js
```

## Docker Environment Issues

### Container Won't Start

**Problem:** Docker container fails to start.

**Solution:**
```bash
# Check Docker logs
docker logs juicetokens-web-1

# Verify Docker version
docker --version  # Should be 20.10.0 or higher

# Check if ports are already in use
lsof -i :4242

# Recreate the container
docker-compose down
docker-compose up --build
```

### Network Connectivity Issues

**Problem:** Containers can't communicate with each other.

**Solution:**
```bash
# Check network configuration
docker network inspect juicetokens-test

# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Volume Mounting Problems

**Problem:** Changes not persisted or volumes not working.

**Solution:**
```bash
# Check volume configuration
docker volume ls
docker volume inspect juicetokens-data

# Clean and recreate volumes
docker-compose down -v
docker-compose up
```

## Token Creation Problems

### Authorization Failures

**Problem:** Token creation fails with authorization errors.

**Solution:**
1. Check if the requesting user has the necessary permissions
2. Verify the lifecycle layer is properly configured
3. Look for authorization errors in the logs:
   ```bash
   grep "Authorization failed" logs/system.log
   ```
4. Make sure the requester ID is valid and properly formatted

### Invalid Token Structure

**Problem:** Created tokens are rejected as invalid.

**Solution:**
1. Validate token structure manually:
   ```javascript
   const token = await lifecycle.createTokens(...);
   const validation = await token.model.validateToken(token[0]);
   console.log(validation);
   ```
2. Check the token creation parameters for correct format
3. Verify protocol buffer definitions match implementation

### Token Batch Issues

**Problem:** Batch creation fails or creates incorrect number of tokens.

**Solution:**
1. Check batch parameters (amount, denomination)
2. Verify batch reference format
3. Look for memory limits if creating large batches
4. Try smaller batch sizes if necessary

## Transport Layer Issues

### QR Code Transport Failures

**Problem:** QR Code transport fails to establish connection.

**Solution:**
1. Check QR code generation:
   ```javascript
   const qrData = await transport.qrKiss.generateQrCode(data);
   console.log(qrData);
   ```
2. Verify camera permissions and functionality
3. Check QR code error correction level and version
4. Try increasing QR code size

### NFC Connection Issues

**Problem:** NFC connection isn't established.

**Solution:**
1. Verify NFC is enabled on both devices
2. Ensure devices are compatible (not all NFC implementations are the same)
3. Check device positioning (NFC antennas need to be aligned)
4. Try disabling and re-enabling NFC

### BLE Connectivity Problems

**Problem:** BLE scanning or connection fails.

**Solution:**
1. Check Bluetooth permissions and that it's enabled
2. Verify BLE support on the device
3. Check for scan timeout issues:
   ```javascript
   // Increase scan duration
   const devices = await transport.ble.scan(10000); // 10 seconds
   ```
4. Try reconnecting after device discovery

## Transaction Failures

### Transaction Timeout

**Problem:** Transactions time out before completing.

**Solution:**
1. Check network connectivity
2. Increase transaction timeout:
   ```javascript
   // Increase timeout
   const pipe = await transport.pipe.createPipe({
     pipeType: 'DIRECT',
     timeoutMs: 60000 // 60 seconds
   }, 'receiver-id');
   ```
3. Verify receiver is online and responsive
4. Look for network congestion or instability

### Transaction Rollback

**Problem:** Transactions fail and roll back unexpectedly.

**Solution:**
1. Check transaction logs:
   ```bash
   grep "Transaction rollback" logs/system.log
   ```
2. Verify token ownership hasn't changed
3. Check for concurrent transactions on the same tokens
4. Ensure trust verification isn't failing

### Double-Spend Attempts

**Problem:** System detecting double-spend attempts.

**Solution:**
1. This is actually a security feature working correctly
2. Check application logic to ensure tokens aren't reused
3. Verify token lists are properly updated after transactions
4. Look for race conditions in transaction creation

## Trust Verification Problems

### Attestation Creation Failures

**Problem:** Unable to create attestations.

**Solution:**
1. Check attestor permissions
2. Verify claim types are valid
3. Ensure cryptographic keys are available
4. Look for formatting issues in attestation request

### Verification Failures

**Problem:** Trust verification fails during transactions.

**Solution:**
1. Check if attestations have expired:
   ```javascript
   const verification = await trust.verifyAttestation(attestation);
   console.log(verification);
   ```
2. Verify trust path exists between parties
3. Check if any attestations have been revoked
4. Ensure trust level meets minimum requirements

### Trust Path Issues

**Problem:** Trust path can't be established.

**Solution:**
1. Create direct attestation between parties
2. Check maximum trust path depth:
   ```javascript
   // Increase path depth
   const path = await trust.findTrustPath(sourceId, targetId, 5);
   ```
3. Look for disconnected trust networks
4. Add intermediate trust relationships if needed

## Performance Issues

### Slow Transaction Processing

**Problem:** Transactions take too long to process.

**Solution:**
1. Profile transaction execution:
   ```javascript
   console.time('transaction');
   await txn.execute();
   console.timeEnd('transaction');
   ```
2. Check for long verification chains
3. Look for network latency issues
4. Consider optimizing token batch sizes

### Memory Usage

**Problem:** System using excessive memory.

**Solution:**
1. Monitor memory usage:
   ```bash
   docker stats juicetokens-web-1
   ```
2. Check for memory leaks (growing usage over time)
3. Limit cache sizes and token batch sizes
4. Consider garbage collection tuning

### CPU Utilization

**Problem:** High CPU usage during operations.

**Solution:**
1. Monitor CPU usage:
   ```bash
   docker stats juicetokens-web-1
   ```
2. Look for excessive cryptographic operations
3. Check for infinite loops or excessive recursion
4. Consider rate limiting or throttling high-volume operations

## Monitoring and Metrics

### Prometheus Connection Issues

**Problem:** Prometheus not collecting metrics.

**Solution:**
1. Check Prometheus endpoint:
   ```bash
   curl http://localhost:4242/metrics
   ```
2. Verify Prometheus configuration:
   ```bash
   cat prometheus/prometheus.yml
   ```
3. Ensure metrics are enabled in JuiceTokens:
   ```javascript
   governance.monitoring.enableMonitoring({
     metricsInterval: 15000,
     detailedLogs: true
   });
   ```
4. Check Prometheus container is running

### Grafana Dashboard Issues

**Problem:** Grafana dashboards not showing data.

**Solution:**
1. Verify Prometheus data source in Grafana
2. Check dashboard configuration
3. Validate metrics are being collected
4. Try importing dashboard templates again

### Health Check Failures

**Problem:** System health checks failing.

**Solution:**
1. Check specific component failures:
   ```javascript
   const health = await governance.monitoring.checkSystemHealth();
   console.log(health.components);
   ```
2. Verify all required services are running
3. Check resource constraints (CPU, memory, disk)
4. Look for timing or synchronization issues

## Common Error Messages

### "Token validation failed"

**Problem:** Token structure is invalid.

**Solution:**
1. Check token creation parameters
2. Verify telomere structure
3. Ensure token ID follows the correct format
4. Look for missing required fields

### "Trust verification failed"

**Problem:** Trust relationship can't be verified.

**Solution:**
1. Check attestation status
2. Verify trust path
3. Look for expired or revoked attestations
4. Ensure claims are appropriate for the operation

### "Pipe connection failed"

**Problem:** Transport pipe couldn't be established.

**Solution:**
1. Check network connectivity
2. Verify pipe configuration
3. Ensure both endpoints are available
4. Look for timeout or configuration issues

### "Transaction failed: tokens already spent"

**Problem:** Attempting to spend tokens that are already spent.

**Solution:**
1. Verify token ownership
2. Check for concurrent transactions
3. Ensure token lists are updated after transactions
4. Look for race conditions in application logic

## Advanced Troubleshooting

### Debug Logging

Enable detailed logging to diagnose issues:

```javascript
// Enable debug logging
const config = {
  logging: {
    level: 'debug',
    destination: 'file',
    filePath: './debug.log'
  }
};

foundation.initialize(config);
```

### Remote Debugging

For debugging deployment issues:

```bash
# Start with inspector
node --inspect dist/packages/app/index.js

# Connect to remote debugger
ssh -L 9229:localhost:9229 user@remote-host
```

### Protocol Tracing

Trace protocol messages for communication issues:

```javascript
// Enable protocol tracing
transport.enableTracing({
  logMessages: true,
  logPayloads: true,
  destinationFile: './protocol-trace.log'
});
```

### Database Inspection

For storage layer issues:

```bash
# Connect to storage directory
cd data

# Backup before making changes
cp -r . ../data-backup

# Examine database files
ls -la
```

## Getting Help

If you continue to experience issues after trying these troubleshooting steps:

1. Check the [GitHub Issues](https://github.com/your-org/juicetokens/issues) for known problems
2. Join the [Discord Community](https://discord.gg/your-invite) for real-time help
3. Submit a detailed bug report with:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Logs and error messages
   - Environment details (OS, Node version, etc.)
   - Screenshots or recordings if applicable 