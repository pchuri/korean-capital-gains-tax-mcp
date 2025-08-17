#!/usr/bin/env node

/**
 * Korean Capital Gains Tax MCP Server
 * 
 * A Model Context Protocol server for calculating Korean capital gains tax
 * on real estate transactions.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { calculateCapitalGainsTax } from './tools/calculate-tax.js';
import { validatePropertyInfo } from './tools/validate-property.js';
import { explainCalculation } from './tools/explain-calculation.js';

/**
 * Tool definitions for the MCP server
 */
const TOOLS: Tool[] = [
  {
    name: 'calculate_capital_gains_tax',
    description: '한국 부동산 양도소득세를 계산합니다. 부동산 정보, 거래 정보, 소유자 정보를 입력하면 상세한 세액 계산 결과를 제공합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        property: {
          type: 'object',
          description: '부동산 정보',
          properties: {
            type: {
              type: 'string',
              enum: ['apartment', 'house', 'land', 'commercial'],
              description: '부동산 유형 (apartment: 아파트, house: 주택, land: 토지, commercial: 상업용)',
            },
            acquisitionPrice: {
              type: 'number',
              description: '취득가액 (원)',
              minimum: 0,
            },
            acquisitionDate: {
              type: 'string',
              description: '취득일자 (YYYY-MM-DD 형식)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            location: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: '시/도 (예: 서울특별시, 경기도)',
                },
                district: {
                  type: 'string',
                  description: '구/군 (예: 강남구, 수원시)',
                },
                isAdjustmentTargetArea: {
                  type: 'boolean',
                  description: '조정대상지역 여부',
                },
              },
              required: ['city', 'district', 'isAdjustmentTargetArea'],
            },
            area: {
              type: 'object',
              properties: {
                totalArea: {
                  type: 'number',
                  description: '전체 면적 (㎡)',
                  minimum: 0,
                },
                exclusiveArea: {
                  type: 'number',
                  description: '전용면적 (㎡)',
                  minimum: 0,
                },
              },
              required: ['totalArea', 'exclusiveArea'],
            },
          },
          required: ['type', 'acquisitionPrice', 'acquisitionDate', 'location', 'area'],
        },
        transaction: {
          type: 'object',
          description: '거래 정보',
          properties: {
            transferPrice: {
              type: 'number',
              description: '양도가액 (원)',
              minimum: 0,
            },
            transferDate: {
              type: 'string',
              description: '양도일자 (YYYY-MM-DD 형식)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            necessaryExpenses: {
              type: 'object',
              description: '필요경비',
              properties: {
                brokerageFee: {
                  type: 'number',
                  description: '중개수수료 (원)',
                  minimum: 0,
                },
                improvementCosts: {
                  type: 'number',
                  description: '개량비 (원)',
                  minimum: 0,
                },
                capitalExpenditures: {
                  type: 'number',
                  description: '자본적지출액 (원)',
                  minimum: 0,
                },
                acquisitionTax: {
                  type: 'number',
                  description: '취득세 등 취득 관련 비용 (원)',
                  minimum: 0,
                },
                other: {
                  type: 'number',
                  description: '기타 필요경비 (원)',
                  minimum: 0,
                },
              },
            },
          },
          required: ['transferPrice', 'transferDate', 'necessaryExpenses'],
        },
        owner: {
          type: 'object',
          description: '소유자 정보',
          properties: {
            householdType: {
              type: 'string',
              enum: ['1household1house', 'multiple', 'temporary2house'],
              description: '세대 구성 유형 (1household1house: 1세대1주택, multiple: 다주택, temporary2house: 일시적2주택)',
            },
            residencePeriod: {
              type: 'object',
              description: '거주기간 (1세대1주택의 경우)',
              properties: {
                start: {
                  type: 'string',
                  description: '거주 시작일 (YYYY-MM-DD)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                end: {
                  type: 'string',
                  description: '거주 종료일 (YYYY-MM-DD)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
              },
              required: ['start', 'end'],
            },
            isLongTermRental: {
              type: 'boolean',
              description: '장기임대주택 여부',
            },
            rentalPeriod: {
              type: 'number',
              description: '임대기간 (년)',
              minimum: 0,
            },
          },
          required: ['householdType'],
        },
        options: {
          type: 'object',
          description: '계산 옵션 (선택사항)',
          properties: {
            calculationDate: {
              type: 'string',
              description: '계산 기준일 (YYYY-MM-DD, 기본값: 양도일)',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            },
            includeDetails: {
              type: 'boolean',
              description: '상세 계산 과정 포함 여부',
            },
            taxLawVersion: {
              type: 'string',
              description: '적용할 세법 버전 (기본값: 최신)',
            },
          },
        },
      },
      required: ['property', 'transaction', 'owner'],
    },
  },
  {
    name: 'validate_property_info',
    description: '입력된 부동산 정보의 유효성을 검증합니다. 필수 필드 누락, 잘못된 형식, 논리적 오류 등을 확인합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        property: {
          type: 'object',
          description: '검증할 부동산 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
        transaction: {
          type: 'object',
          description: '검증할 거래 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
        owner: {
          type: 'object',
          description: '검증할 소유자 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
        options: {
          type: 'object',
          description: '검증할 계산 옵션 (calculate_capital_gains_tax와 동일한 스키마)',
        },
      },
      required: ['property', 'transaction', 'owner'],
    },
  },
  {
    name: 'explain_calculation',
    description: '양도소득세 계산 과정과 적용 법령을 상세히 설명합니다. 세율, 공제, 비과세 요건 등의 근거를 제공합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        property: {
          type: 'object',
          description: '설명할 부동산 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
        transaction: {
          type: 'object',
          description: '설명할 거래 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
        owner: {
          type: 'object',
          description: '설명할 소유자 정보 (calculate_capital_gains_tax와 동일한 스키마)',
        },
      },
      required: ['property', 'transaction', 'owner'],
    },
  },
];

/**
 * Main MCP server class
 */
class CapitalGainsTaxServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'korean-capital-gains-tax-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: TOOLS };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'calculate_capital_gains_tax':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await calculateCapitalGainsTax(args as any), null, 2),
                },
              ],
            };

          case 'validate_property_info':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await validatePropertyInfo(args as any), null, 2),
                },
              ],
            };

          case 'explain_calculation':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await explainCalculation(args as any), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: errorMessage,
                tool: name,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: unknown) => {
      console.error('[MCP Error]', error);
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Keep the process running
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

/**
 * Start the server
 */
async function main(): Promise<void> {
  const server = new CapitalGainsTaxServer();
  await server.run();
}

// Export main function for external use
export default main;

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
