import { SuiClient, SuiEventFilter } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';

export interface HealthCheck {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    timestamp: number;
}

export interface Alert {
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
    module: string;
    data?: any;
}

export class Monitoring {
    private alerts: Alert[] = [];
    private healthChecks: Map<string, HealthCheck> = new Map();

    constructor(private provider: SuiClient) {
        this.startMonitoring();
    }

    private async startMonitoring() {
        // Monitor contract events
        this.monitorContractEvents();
        
        // Periodic health checks
        setInterval(() => this.performHealthChecks(), 60000); // Every minute
    }

    private async monitorContractEvents() {
        const eventTypes = [
            'battle::BattleFinished',
            'marketplace::NFTSold',
            'trading::TradeAccepted',
            'staking::RewardsClaimed'
        ];

        for (const eventType of eventTypes) {
            const filter: SuiEventFilter = {
                MoveEventType: `${PACKAGE_ID}::${eventType}`,
            };
            this.pollEventsLoop(filter, eventType);
        }
    }

    private async pollEventsLoop(filter: SuiEventFilter, eventType: string, pollInterval = 5000) {
        let cursor: any = null;
        while (true) {
            try {
                const { data, nextCursor, hasNextPage } = await this.provider.queryEvents({
                    query: filter,
                    cursor,
                    order: 'ascending',
                });
                for (const event of data) {
                    this.processEvent(eventType, event);
                }
                cursor = nextCursor;
                if (!hasNextPage) await new Promise(res => setTimeout(res, pollInterval));
            } catch (error) {
                this.addAlert({
                    type: 'error',
                    message: `Polling error for ${eventType}`,
                    timestamp: Date.now(),
                    module: eventType.split('::')[0],
                    data: error
                });
                await new Promise(res => setTimeout(res, pollInterval));
            }
        }
    }

    private async performHealthChecks() {
        // Check Battle system health
        await this.checkBattleSystemHealth();
        
        // Check Marketplace health
        await this.checkMarketplaceHealth();
        
        // Check Trading system health
        await this.checkTradingSystemHealth();
        
        // Check Staking system health
        await this.checkStakingSystemHealth();
    }

    private async checkBattleSystemHealth() {
        try {
            const filter: SuiEventFilter = {
                MoveEventType: `${PACKAGE_ID}::battle::BattleFinished`,
                TimeRange: {
                    startTime: String(Date.now() - 3600000), // Last hour as string
                    endTime: String(Date.now())
                }
            };

            const events = await this.provider.queryEvents({ query: filter });
            const eventCount = events.data.length;            
            this.updateHealthCheck('battle', {
                status: eventCount > 0 ? 'healthy' : 'warning',
                message: eventCount > 0
                    ? `Battle system operating normally (${eventCount} events in last hour)`
                    : 'No battle events detected in the last hour',
                timestamp: Date.now()
            });
        } catch (error) {
            this.updateHealthCheck('battle', {
                status: 'error',
                message: 'Battle system error',
                timestamp: Date.now()
            });
        }
    }

    private async checkMarketplaceHealth() {
        try {
            const filter: SuiEventFilter = {
                MoveEventType: `${PACKAGE_ID}::marketplace::NFTSold`,
                TimeRange: {
                    startTime: String(Date.now() - 3600000),
                    endTime: String(Date.now())
                }
            };

            const events = await this.provider.queryEvents({ query: filter });
            const eventCount = events.data.length;
            this.updateHealthCheck('marketplace', {
                status: eventCount > 0 ? 'healthy' : 'warning',
                message: eventCount > 0
                    ? `Marketplace operating normally (${eventCount} events in last hour)`
                    : 'No marketplace events detected in the last hour',
                timestamp: Date.now()
            });
        } catch (error) {
            this.updateHealthCheck('marketplace', {
                status: 'error',
                message: 'Marketplace system error',
                timestamp: Date.now()
            });
        }
    }

    private async checkTradingSystemHealth() {
        try {
            const filter: SuiEventFilter = {
                MoveEventType: `${PACKAGE_ID}::trading::TradeAccepted`,
                TimeRange: {
                    startTime: String(Date.now() - 3600000),
                    endTime: String(Date.now())
                }
            };

            const events = await this.provider.queryEvents({ query: filter });
            const eventCount = events.data.length;
            this.updateHealthCheck('trading', {
                status: eventCount > 0 ? 'healthy' : 'warning',
                message: eventCount > 0
                    ? `Trading system operating normally (${eventCount} events in last hour)`
                    : 'No trading events detected in the last hour',
                timestamp: Date.now()
            });
        } catch (error) {
            this.updateHealthCheck('trading', {
                status: 'error',
                message: 'Trading system error',
                timestamp: Date.now()
            });
        }
    }

    private async checkStakingSystemHealth() {
        try {
            const filter: SuiEventFilter = {
                MoveEventType: `${PACKAGE_ID}::staking::RewardsClaimed`,
                TimeRange: {
                    startTime: String(Date.now() - 3600000),
                    endTime: String(Date.now())
                }
            };

            const events = await this.provider.queryEvents({ query: filter });
            const eventCount = events.data.length;
            this.updateHealthCheck('staking', {
                status: eventCount > 0 ? 'healthy' : 'warning',
                message: eventCount > 0
                    ? `Staking system operating normally (${eventCount} events in last hour)`
                    : 'No staking events detected in the last hour',
                timestamp: Date.now()
            });
        } catch (error) {
            this.updateHealthCheck('staking', {
                status: 'error',
                message: 'Staking system error',
                timestamp: Date.now()
            });
        }
    }

    private processEvent(eventType: string, event: any) {
        const module = eventType.split('::')[0];
        console.log(`[${module}] Event received:`, eventType, event);

        // Add monitoring logic based on event type
        switch (eventType) {
            case 'battle::BattleFinished':
                this.processBattleEvent(event);
                break;
            case 'marketplace::NFTSold':
                this.processMarketplaceEvent(event);
                break;
            case 'trading::TradeAccepted':
                this.processTradingEvent(event);
                break;
            case 'staking::RewardsClaimed':
                this.processStakingEvent(event);
                break;
        }
    }

    private processBattleEvent(event: any) {
        // Monitor for unusual battle patterns
        const parsed = event?.parsedJson as { experience_gained?: number } | undefined;
        if (parsed && parsed.experience_gained && parsed.experience_gained > 1000) { // Example threshold
            this.addAlert({
                type: 'warning',
                message: 'Unusually high experience gain detected',
                timestamp: Date.now(),
                module: 'battle',
                data: event
            });
        }
    }

    private processMarketplaceEvent(event: any) {
        // Monitor for unusual price patterns
        const parsed = event?.parsedJson as { price?: number } | undefined;
        if (parsed && parsed.price && parsed.price > 1000000) { // Example threshold
            this.addAlert({
                type: 'warning',
                message: 'High-value marketplace transaction detected',
                timestamp: Date.now(),
                module: 'marketplace',
                data: event
            });
        }
    }

    private processTradingEvent(event: any) {
        // Monitor for unusual trading patterns
        const parsed = event?.parsedJson as { token_amount?: number } | undefined;
        if (parsed && parsed.token_amount && parsed.token_amount > 1000000) { // Example threshold
            this.addAlert({
                type: 'warning',
                message: 'High-value trade detected',
                timestamp: Date.now(),
                module: 'trading',
                data: event
            });
        }
    }

    private processStakingEvent(event: any) {
        // Monitor for unusual staking patterns
        const parsed = event?.parsedJson as { rewards_claimed?: number } | undefined;
        if (parsed && parsed.rewards_claimed && parsed.rewards_claimed > 1000000) { // Example threshold
            this.addAlert({
                type: 'warning',
                message: 'Large reward claim detected',
                timestamp: Date.now(),
                module: 'staking',
                data: event
            });
        }
    }

    private addAlert(alert: Alert) {
        this.alerts.push(alert);
        // Implement alert notification system here (e.g., webhook, email)
        console.log('New Alert:', alert);
    }

    private updateHealthCheck(module: string, health: HealthCheck) {
        this.healthChecks.set(module, health);
    }

    // Public methods for external monitoring
    public getAlerts(fromTimestamp?: number): Alert[] {
        if (fromTimestamp) {
            return this.alerts.filter(alert => alert.timestamp >= fromTimestamp);
        }
        return this.alerts;
    }

    public getHealthStatus(): Map<string, HealthCheck> {
        return this.healthChecks;
    }

    public getModuleHealth(module: string): HealthCheck | undefined {
        return this.healthChecks.get(module);
    }
} 