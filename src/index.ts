#!/usr/bin/env node
/**
 * 🚀 NovaForge AI Blockchain & Token Creator System
 * Main Entry Point
 * 
 * Initializes and coordinates all system components:
 * - AI Empire (Orchestrator, Overseers, Healing Agents)
 * - Blockchain Infrastructure (Nova Chain, Token Creation)
 * - Revenue Generation Systems
 * - Wallet Infrastructure
 */

import { Logger } from '@core/utils/logger';
import { ConfigManager } from '@core/config/config-manager';
import { SystemOrchestrator } from '@ai-empire/orchestrator/system-orchestrator';
import { CentralLoader } from '@ai-empire/central-loader/central-loader';
import { NovaChainLauncher } from '@blockchain/nova-chain/launcher';
import { RevenueAutomation } from '@revenue/automation/revenue-automation';
import { WalletManager } from '@wallets/api/wallet-manager';

class NovaForgeSystem {
  private logger: Logger;
  private config: ConfigManager;
  private orchestrator: SystemOrchestrator;
  private centralLoader: CentralLoader;
  private blockchainLauncher: NovaChainLauncher;
  private revenueSystem: RevenueAutomation;
  private walletManager: WalletManager;

  constructor() {
    this.logger = new Logger('NovaForgeSystem');
    this.config = new ConfigManager();
    
    this.logger.info('🚀 Initializing NovaForge AI Blockchain & Token Creator System');
  }

  /**
   * Initialize all system components
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('📋 Loading system configuration...');
      await this.config.load();

      this.logger.info('🔄 Starting Central Loader...');
      this.centralLoader = new CentralLoader(this.config);
      await this.centralLoader.initialize();

      this.logger.info('🎯 Starting System Orchestrator...');
      this.orchestrator = new SystemOrchestrator(this.config);
      await this.orchestrator.initialize();

      this.logger.info('⛓️ Launching Nova Blockchain...');
      this.blockchainLauncher = new NovaChainLauncher(this.config);
      await this.blockchainLauncher.start();

      this.logger.info('💰 Starting Revenue Generation Systems...');
      this.revenueSystem = new RevenueAutomation(this.config);
      await this.revenueSystem.start();

      this.logger.info('🌌 Initializing Wallet Manager...');
      this.walletManager = new WalletManager(this.config);
      await this.walletManager.initialize();

      this.logger.success('✅ NovaForge System Successfully Initialized!');
      this.logger.info('🌟 System is now running autonomously...');
      
      // Keep the system running
      this.setupGracefulShutdown();
      await this.runMainLoop();
      
    } catch (error) {
      this.logger.error('❌ System initialization failed:', error);
      process.exit(1);
    }
  }

  /**
   * Main system loop
   */
  private async runMainLoop(): Promise<void> {
    while (true) {
      try {
        // System health checks and coordination
        await this.orchestrator.performHealthCheck();
        await this.revenueSystem.optimize();
        
        // Wait before next cycle
        await this.sleep(30000); // 30 seconds
        
      } catch (error) {
        this.logger.error('Main loop error:', error);
        await this.sleep(5000); // Wait 5 seconds before retry
      }
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
      
      try {
        await this.revenueSystem?.stop();
        await this.blockchainLauncher?.stop();
        await this.orchestrator?.shutdown();
        await this.centralLoader?.shutdown();
        
        this.logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the system if this file is run directly
if (require.main === module) {
  const novaForge = new NovaForgeSystem();
  novaForge.initialize().catch(error => {
    console.error('💥 Fatal error starting NovaForge System:', error);
    process.exit(1);
  });
}

export { NovaForgeSystem };