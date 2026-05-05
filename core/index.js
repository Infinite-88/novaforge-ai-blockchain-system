#!/usr/bin/env node

/**
 * 🚀 NOVAFORGE AI BLOCKCHAIN & TOKEN CREATOR SYSTEM
 * Central System Launcher
 * 
 * This is the main entry point for the entire NovaForge ecosystem.
 * It initializes and coordinates all subsystems:
 * - AI Empire (Orchestrator, Agents, Overseers)
 * - Blockchain Infrastructure (Nova Chain, Token Creator)
 * - Revenue Systems (Business Automation)
 * - Wallet Integration (Cosmic Nexus)
 */

const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const winston = require('winston');
require('dotenv').config();

// Import subsystems
const AIEmpire = require('../ai-empire/orchestrator');
const BlockchainSystem = require('../blockchain/nova-chain');
const RevenueEngine = require('../revenue/automation');
const WalletIntegration = require('../wallets/cosmic-nexus');
const { SystemConfig } = require('./config');
const { Logger } = require('./utils/logger');

class NovaForgeSystem {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.logger = new Logger('NovaForge-Main');
        this.config = new SystemConfig();
        
        // Subsystem instances
        this.aiEmpire = null;
        this.blockchain = null;
        this.revenueEngine = null;
        this.walletSystem = null;
        
        this.isRunning = false;
        this.systemHealth = {
            ai: false,
            blockchain: false,
            revenue: false,
            wallets: false
        };
    }

    /**
     * Initialize the entire NovaForge system
     */
    async initialize() {
        try {
            this.logger.info('🚀 Initializing NovaForge AI Blockchain System...');
            
            // Setup Express middleware
            this.setupMiddleware();
            
            // Initialize subsystems in order
            await this.initializeSubsystems();
            
            // Setup WebSocket for real-time communication
            this.setupWebSocket();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            this.logger.info('✅ NovaForge System initialized successfully!');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize NovaForge System:', error);
            throw error;
        }
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });

        // Main API endpoint
        this.app.get('/api/status', (req, res) => {
            res.json({
                system: 'NovaForge AI Blockchain System',
                status: 'running',
                health: this.systemHealth,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const allHealthy = Object.values(this.systemHealth).every(status => status);
            res.status(allHealthy ? 200 : 503).json({
                status: allHealthy ? 'healthy' : 'degraded',
                subsystems: this.systemHealth
            });
        });
    }

    /**
     * Initialize all subsystems
     */
    async initializeSubsystems() {
        this.logger.info('🤖 Starting AI Empire...');
        this.aiEmpire = new AIEmpire(this.config.ai);
        await this.aiEmpire.initialize();
        this.systemHealth.ai = true;
        
        this.logger.info('⛓️ Starting Blockchain System...');
        this.blockchain = new BlockchainSystem(this.config.blockchain);
        await this.blockchain.initialize();
        this.systemHealth.blockchain = true;
        
        this.logger.info('💰 Starting Revenue Engine...');
        this.revenueEngine = new RevenueEngine(this.config.revenue);
        await this.revenueEngine.initialize();
        this.systemHealth.revenue = true;
        
        this.logger.info('🌌 Starting Wallet System...');
        this.walletSystem = new WalletIntegration(this.config.wallets);
        await this.walletSystem.initialize();
        this.systemHealth.wallets = true;
        
        // Connect subsystems
        await this.connectSubsystems();
    }

    /**
     * Connect subsystems for inter-communication
     */
    async connectSubsystems() {
        this.logger.info('🔗 Connecting subsystems...');
        
        // AI Empire ↔ Blockchain
        this.aiEmpire.connectToBlockchain(this.blockchain);
        this.blockchain.connectToAI(this.aiEmpire);
        
        // Revenue Engine ↔ AI Empire
        this.revenueEngine.connectToAI(this.aiEmpire);
        this.aiEmpire.connectToRevenue(this.revenueEngine);
        
        // Wallet System ↔ Blockchain
        this.walletSystem.connectToBlockchain(this.blockchain);
        this.blockchain.connectToWallets(this.walletSystem);
        
        this.logger.info('✅ Subsystems connected successfully!');
    }

    /**
     * Setup WebSocket for real-time communication
     */
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            this.logger.info('📡 New WebSocket connection established');
            
            ws.send(JSON.stringify({
                type: 'welcome',
                message: 'Connected to NovaForge AI System',
                timestamp: new Date().toISOString()
            }));
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    this.logger.error('WebSocket message error:', error);
                }
            });
        });
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'get_status':
                ws.send(JSON.stringify({
                    type: 'status',
                    health: this.systemHealth,
                    timestamp: new Date().toISOString()
                }));
                break;
                
            case 'ai_command':
                if (this.aiEmpire) {
                    this.aiEmpire.executeCommand(data.command, data.params);
                }
                break;
                
            case 'blockchain_query':
                if (this.blockchain) {
                    this.blockchain.handleQuery(data.query);
                }
                break;
        }
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        setInterval(async () => {
            try {
                // Check AI Empire health
                this.systemHealth.ai = this.aiEmpire ? await this.aiEmpire.healthCheck() : false;
                
                // Check Blockchain health
                this.systemHealth.blockchain = this.blockchain ? await this.blockchain.healthCheck() : false;
                
                // Check Revenue Engine health
                this.systemHealth.revenue = this.revenueEngine ? await this.revenueEngine.healthCheck() : false;
                
                // Check Wallet System health
                this.systemHealth.wallets = this.walletSystem ? await this.walletSystem.healthCheck() : false;
                
            } catch (error) {
                this.logger.error('Health check error:', error);
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Start the NovaForge system
     */
    async start() {
        try {
            await this.initialize();
            
            const port = this.config.system.port || 3000;
            
            this.server.listen(port, () => {
                this.isRunning = true;
                this.logger.info(`🌟 NovaForge AI Blockchain System running on port ${port}`);
                this.logger.info('🚀 All systems operational!');
                this.logger.info('📊 Dashboard: http://localhost:' + port + '/api/status');
            });
            
        } catch (error) {
            this.logger.error('❌ Failed to start NovaForge System:', error);
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger.info('🔄 Shutting down NovaForge System...');
        
        this.isRunning = false;
        
        // Shutdown subsystems
        if (this.aiEmpire) await this.aiEmpire.shutdown();
        if (this.blockchain) await this.blockchain.shutdown();
        if (this.revenueEngine) await this.revenueEngine.shutdown();
        if (this.walletSystem) await this.walletSystem.shutdown();
        
        // Close server
        if (this.server) {
            this.server.close();
        }
        
        this.logger.info('✅ NovaForge System shutdown complete');
    }
}

// Handle process events
process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    if (global.novaForgeSystem) {
        await global.novaForgeSystem.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    if (global.novaForgeSystem) {
        await global.novaForgeSystem.shutdown();
    }
    process.exit(0);
});

// Start the system if this file is run directly
if (require.main === module) {
    const system = new NovaForgeSystem();
    global.novaForgeSystem = system;
    system.start().catch(console.error);
}

module.exports = NovaForgeSystem;