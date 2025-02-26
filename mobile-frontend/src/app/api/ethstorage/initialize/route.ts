import { FlatDirectory } from 'ethstorage-sdk';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  console.log('API route hit: /api/ethstorage/initialize');
  
  try {
    const rpc = process.env.ETHSTORAGE_RPC_URL || "https://rpc.testnet.l2.quarkchain.io:8545";
    const ethStorageRpc = process.env.ETHSTORAGE_STORAGE_RPC_URL || "https://rpc.testnet.l2.ethstorage.io:9540";
    const privateKey = process.env.ETHSTORAGE_PRIVATE_KEY;
    
    console.log('Config:', { rpc, ethStorageRpc, hasPrivateKey: !!privateKey });

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key not configured' },
        { status: 500 }
      );
    }

    // Create providers first
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Created wallet and provider');

    // Create FlatDirectory with the wallet
    const flatDirectory = await FlatDirectory.create({
      signer: wallet,
      ethStorageRpc,
    });

    console.log('FlatDirectory instance created successfully');

    // Deploy the contract
    const contractAddress = await flatDirectory.deploy();
    console.log('Contract deployed successfully:', contractAddress);

    return NextResponse.json({ 
      success: true, 
      contractAddress 
    });
  } catch (error) {
    console.error('Error initializing ETHStorage:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to initialize ETHStorage',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 