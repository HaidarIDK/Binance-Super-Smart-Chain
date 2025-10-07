# Force Render to Redeploy

## Option 1: Manual Redeploy (Easiest)

1. Go to: https://dashboard.render.com
2. Find your **bssc-rpc** service
3. Click **"Manual Deploy"** dropdown
4. Click **"Deploy latest commit"**
5. Wait 2-3 minutes

## Option 2: Make a Dummy Commit

Run this to force a new deployment:

```bash
git commit --allow-empty -m "Force Render redeploy - Chain ID 47964"
git push origin master
```

## Option 3: Check Render Logs

1. Go to your Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Check if it's actually deploying or if there's an error

## Why It's Not Updating:

Render might be:
- Still building from an old commit
- Having a build error
- Using a cached version
- Not set to auto-deploy

## Quick Fix NOW:

Just use Chain ID 56 for testing! It works fine for demos.

```
Network Name: BSSC Testnet
RPC URL: https://bssc-rpc.bssc.live
Chain ID: 56
Currency Symbol: BNB
```

MetaMask will ask "This Chain ID is used by BSC" - just click "Use this network anyway" or "Update" and it will work!

