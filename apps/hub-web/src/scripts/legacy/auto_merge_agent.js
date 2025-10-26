#!/usr/bin/env node

/**
 * OAA Auto-Merge Agent
 * Automatically merges files from OAA-edits/v1 and v2 folders into root directory
 * Runs every hour to keep the repository organized
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class OAAAutoMergeAgent {
    constructor() {
        this.rootDir = __dirname + '/..';
        this.v1Dir = path.join(this.rootDir, 'OAA-edits', 'v1');
        this.v2Dir = path.join(this.rootDir, 'OAA-edits', 'v2');
        this.intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds
        this.isRunning = false;
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] OAA Auto-Merge Agent: ${message}`);
    }

    async checkAndMergeDirectory(sourceDir, version) {
        try {
            if (!fs.existsSync(sourceDir)) {
                this.log(`Directory ${sourceDir} does not exist, skipping...`);
                return;
            }

            const items = fs.readdirSync(sourceDir);
            if (items.length === 0) {
                this.log(`No items found in ${version} directory`);
                return;
            }

            this.log(`Found ${items.length} items in ${version} directory`);

            for (const item of items) {
                const sourcePath = path.join(sourceDir, item);
                const destPath = path.join(this.rootDir, item);

                if (fs.statSync(sourcePath).isDirectory()) {
                    // Handle directory
                    if (fs.existsSync(destPath)) {
                        this.log(`Directory ${item} already exists in root, skipping...`);
                    } else {
                        this.log(`Copying directory ${item} from ${version}...`);
                        execSync(`xcopy "${sourcePath}" "${destPath}" /E /I /Y`, { stdio: 'inherit' });
                        this.log(`Successfully copied directory ${item}`);
                    }
                } else {
                    // Handle file
                    if (fs.existsSync(destPath)) {
                        this.log(`File ${item} already exists in root, skipping...`);
                    } else {
                        this.log(`Copying file ${item} from ${version}...`);
                        fs.copyFileSync(sourcePath, destPath);
                        this.log(`Successfully copied file ${item}`);
                    }
                }
            }

            // Clean up source directory after successful merge
            this.cleanupDirectory(sourceDir, version);

        } catch (error) {
            this.log(`Error processing ${version} directory: ${error.message}`);
        }
    }

    cleanupDirectory(sourceDir, version) {
        try {
            const items = fs.readdirSync(sourceDir);
            for (const item of items) {
                const itemPath = path.join(sourceDir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    execSync(`rmdir /S /Q "${itemPath}"`, { stdio: 'inherit' });
                } else {
                    fs.unlinkSync(itemPath);
                }
            }
            this.log(`Cleaned up ${version} directory`);
        } catch (error) {
            this.log(`Error cleaning up ${version} directory: ${error.message}`);
        }
    }

    async performMerge() {
        this.log('Starting auto-merge process...');
        
        try {
            // Check and merge v1
            await this.checkAndMergeDirectory(this.v1Dir, 'v1');
            
            // Check and merge v2
            await this.checkAndMergeDirectory(this.v2Dir, 'v2');
            
            this.log('Auto-merge process completed successfully');
        } catch (error) {
            this.log(`Auto-merge process failed: ${error.message}`);
        }
    }

    start() {
        if (this.isRunning) {
            this.log('Agent is already running');
            return;
        }

        this.isRunning = true;
        this.log('Starting OAA Auto-Merge Agent...');
        this.log(`Will check for new files every ${this.intervalMs / 1000 / 60} minutes`);

        // Perform initial merge
        this.performMerge();

        // Set up interval
        this.interval = setInterval(() => {
            this.performMerge();
        }, this.intervalMs);

        this.log('Agent started successfully');
    }

    stop() {
        if (!this.isRunning) {
            this.log('Agent is not running');
            return;
        }

        if (this.interval) {
            clearInterval(this.interval);
        }

        this.isRunning = false;
        this.log('Agent stopped');
    }

    // Handle graceful shutdown
    setupGracefulShutdown() {
        process.on('SIGINT', () => {
            this.log('Received SIGINT, shutting down gracefully...');
            this.stop();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            this.log('Received SIGTERM, shutting down gracefully...');
            this.stop();
            process.exit(0);
        });
    }
}

// Main execution
if (require.main === module) {
    const agent = new OAAAutoMergeAgent();
    agent.setupGracefulShutdown();
    agent.start();
}

module.exports = OAAAutoMergeAgent;


