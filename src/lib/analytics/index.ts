import { SuiClient, SuiEventFilter } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';

export class Analytics {
    constructor(private provider: SuiClient) {}

    async getBattleStatistics(startTime?: number, endTime?: number) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::battle::BattleFinished`,
            ...(startTime && endTime ? { TimeRange: { startTime: String(startTime), endTime: String(endTime) } } : {})
        };
        try {
            const events = await this.provider.queryEvents({ query: filter });
            return this.processBattleStats(events.data);
        } catch (error) {
            console.error('Error fetching battle statistics:', error);
            return { totalBattles: 0, winnerDistribution: {}, averageExperience: 0, totalRewards: 0 };
        }
    }

    async getTradingVolume(startTime?: number, endTime?: number) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::trading::TradeAccepted`,
            ...(startTime && endTime ? { TimeRange: { startTime: String(startTime), endTime: String(endTime) } } : {})
        };
        try {
            const events = await this.provider.queryEvents({ query: filter });
            return this.processTradingStats(events.data);
        } catch (error) {
            console.error('Error fetching trading volume:', error);
            return { totalTrades: 0, volumeByToken: 0, uniqueTraders: 0 };
        }
    }

    async getMarketplaceActivity(startTime?: number, endTime?: number) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::marketplace::NFTSold`,
            ...(startTime && endTime ? { TimeRange: { startTime: String(startTime), endTime: String(endTime) } } : {})
        };
        try {
            const events = await this.provider.queryEvents({ query: filter });
            return this.processMarketplaceStats(events.data);
        } catch (error) {
            console.error('Error fetching marketplace activity:', error);
            return { totalSales: 0, totalVolume: 0, averagePrice: 0, uniqueBuyers: 0, uniqueSellers: 0 };
        }
    }

    async getStakingMetrics(startTime?: number, endTime?: number) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::staking::NFTStaked`,
            ...(startTime && endTime ? { TimeRange: { startTime: String(startTime), endTime: String(endTime) } } : {})
        };
        try {
            const events = await this.provider.queryEvents({ query: filter });
            return this.processStakingStats(events.data);
        } catch (error) {
            console.error('Error fetching staking metrics:', error);
            return { totalStaked: 0, uniqueStakers: 0, totalRewardsClaimed: 0 };
        }
    }

    private processBattleStats(events: any[]) {
        return {
            totalBattles: events.length,
            winnerDistribution: this.countByField(events, 'winner'),
            averageExperience: this.calculateAverage(events, 'experience_gained'),
            totalRewards: this.sumField(events, 'reward_amount')
        };
    }

    private processTradingStats(events: any[]) {
        return {
            totalTrades: events.length,
            volumeByToken: this.sumField(events, 'token_amount'),
            uniqueTraders: new Set(events.map(e => e.from || e.to)).size
        };
    }

    private processMarketplaceStats(events: any[]) {
        return {
            totalSales: events.length,
            totalVolume: this.sumField(events, 'price'),
            averagePrice: this.calculateAverage(events, 'price'),
            uniqueBuyers: new Set(events.map(e => e.buyer)).size,
            uniqueSellers: new Set(events.map(e => e.seller)).size
        };
    }

    private processStakingStats(events: any[]) {
        return {
            totalStaked: events.length,
            uniqueStakers: new Set(events.map(e => e.owner)).size,
            totalRewardsClaimed: this.sumField(events, 'rewards_claimed')
        };
    }

    private countByField(events: any[], field: string) {
        return events.reduce((acc: {[key: string]: number}, event) => {
            const value = event[field];
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }

    private sumField(events: any[], field: string) {
        return events.reduce((sum, event) => sum + (Number(event[field]) || 0), 0);
    }

    private calculateAverage(events: any[], field: string) {
        const sum = this.sumField(events, field);
        return events.length > 0 ? sum / events.length : 0;
    }
} 