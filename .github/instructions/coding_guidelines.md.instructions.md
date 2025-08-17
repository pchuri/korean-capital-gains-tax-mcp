---
applyTo: '**'
---
# Korean Capital Gains Tax MCP Server - Development Guidelines

## 📋 Project Overview

This project implements a **Model Context Protocol (MCP) Server** for calculating Korean capital gains tax on real estate transactions. The server provides accurate tax calculations following Korean tax law, specifically targeting residential property sales.

### Key Objectives
- Provide precise capital gains tax calculations for Korean real estate
- Support various property types (apartments, houses, land)
- Handle complex tax scenarios (1-household-1-house exemptions, multiple property owners, etc.)
- Ensure compliance with current Korean tax regulations
- Deliver a robust TypeScript-based MCP server

## 🏗️ Architecture Requirements

### Technology Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Build**: tsx for development, tsc for production

### Project Structure
```
korean-capital-gains-tax-mcp/
├── src/
│   ├── server.ts                 # Main MCP server entry point
│   ├── types/
│   │   ├── property.ts           # Property-related type definitions
│   │   ├── tax.ts               # Tax calculation types
│   │   └── index.ts             # Type exports
│   ├── calculators/
│   │   ├── base-calculator.ts    # Base tax calculation logic
│   │   ├── single-house.ts      # 1세대 1주택 calculations
│   │   ├── multiple-house.ts    # Multi-property calculations
│   │   ├── short-term.ts        # Short-term holding penalties
│   │   └── index.ts             # Calculator exports
│   ├── utils/
│   │   ├── date-utils.ts        # Date/period calculations
│   │   ├── tax-rates.ts         # Current tax rate tables
│   │   ├── validators.ts        # Input validation
│   │   └── constants.ts         # Tax law constants
│   └── tools/
│       ├── calculate-tax.ts     # Main calculation tool
│       ├── validate-property.ts # Property validation tool
│       └── explain-calculation.ts # Calculation explanation tool
├── docs/
│   ├── CAPITAL_GAINS_TAX_GUIDE.md
│   ├── API_REFERENCE.md
│   └── EXAMPLES.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── README.md
```

## 🎯 Core Functionality Requirements

### 1. MCP Tools Implementation

#### Tool: `calculate_capital_gains_tax`
```typescript
interface CalculateTaxParams {
  property: PropertyInfo;
  transaction: TransactionInfo;
  owner: OwnerInfo;
  options?: CalculationOptions;
}

interface PropertyInfo {
  type: 'apartment' | 'house' | 'land' | 'commercial';
  acquisitionPrice: number;
  acquisitionDate: string; // ISO date
  location: {
    city: string;
    district: string;
    isAdjustmentTargetArea: boolean; // 조정대상지역
  };
  area: {
    totalArea: number;
    exclusiveArea: number;
  };
}

interface TransactionInfo {
  transferPrice: number;
  transferDate: string; // ISO date
  necessaryExpenses: {
    brokerageFee?: number;
    improvementCosts?: number;
    capitalExpenditures?: number;
    acquisitionTax?: number;
    other?: number;
  };
}

interface OwnerInfo {
  householdType: '1household1house' | 'multiple' | 'temporary2house';
  residencePeriod?: {
    start: string;
    end: string;
  };
  isLongTermRental?: boolean;
  rentalPeriod?: number; // years
}
```

#### Tool: `validate_property_info`
- Validate input parameters
- Check for required fields
- Ensure data consistency
- Return validation errors with helpful messages

#### Tool: `explain_calculation`
- Provide step-by-step calculation breakdown
- Explain applied tax rates and exemptions
- Show relevant tax law references
- Generate human-readable summaries

### 2. Tax Calculation Logic

#### Core Calculation Flow
```typescript
// 1. Calculate capital gains
const capitalGains = transferPrice - acquisitionPrice - necessaryExpenses;

// 2. Apply long-term holding special deduction
const longTermDeduction = calculateLongTermDeduction(
  capitalGains, 
  holdingPeriod, 
  propertyType, 
  ownerInfo
);

// 3. Calculate taxable income
const taxableIncome = capitalGains - longTermDeduction - BASIC_DEDUCTION;

// 4. Apply appropriate tax rate
const taxAmount = calculateTax(taxableIncome, applicableTaxRate);

// 5. Apply exemptions and special cases
const finalTax = applyExemptions(taxAmount, exemptionType);
```

#### Critical Implementation Details

1. **Holding Period Calculation**
   - Use acquisition date to transfer date
   - Handle leap years correctly
   - Consider inheritance and gift scenarios

2. **Tax Rate Application**
   - Progressive tax rates for basic taxation
   - Heavy taxation for short-term holdings
   - Multiple property owner penalties
   - Adjustment target area surcharges

3. **1-Household-1-House Exemptions**
   - Validate household composition
   - Check residence requirements (2+ years)
   - Apply 1.2 billion won exemption threshold
   - Calculate proportional taxation for high-value properties

4. **Long-Term Holding Special Deduction**
   - Standard deduction rates by holding period
   - Enhanced rates for 1-household-1-house with residence
   - Exclusions for multiple property owners in adjustment areas

## 🧪 Testing Requirements

### Unit Tests
- Test each tax calculation component independently
- Validate edge cases and boundary conditions
- Test error handling and validation logic
- Achieve >90% code coverage

### Integration Tests
- Test complete calculation flows
- Validate against real-world scenarios
- Test MCP tool integration
- Performance testing for complex calculations

### Test Data
Create comprehensive test fixtures covering:
- Various property types and values
- Different holding periods
- Multiple ownership scenarios
- Adjustment target areas
- Special cases (inheritance, gifts, etc.)

## 📝 Code Quality Standards

### TypeScript Guidelines
- **Strict mode enabled**: All TypeScript strict flags on
- **Type safety**: No `any` types; use proper type definitions
- **Interface design**: Clear, self-documenting interfaces
- **Error handling**: Comprehensive error types and handling

### Code Style
- **ESLint**: Use recommended TypeScript rules
- **Prettier**: Consistent code formatting
- **Naming**: Clear, descriptive names following Korean tax terminology
- **Comments**: JSDoc for all public interfaces

### Error Handling
```typescript
// Define specific error types
export class TaxCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TaxCalculationError';
  }
}

// Use Result pattern for calculations
export type CalculationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: TaxCalculationError;
};
```

## 🎨 User Experience

### MCP Tool Responses
- **Clear calculations**: Step-by-step breakdown
- **Explanations**: Why specific rates/exemptions apply
- **Warnings**: Alert to potential issues or required documents
- **References**: Cite relevant tax law sections

### Input Validation
- Friendly error messages in both Korean and English
- Suggestions for fixing common input errors
- Clear documentation of required vs. optional fields

## 📚 Documentation Requirements

### API Documentation
- Complete tool interface documentation
- Parameter descriptions and constraints
- Example requests and responses
- Error code reference

### User Guide
- Common use case examples
- Step-by-step calculation walkthroughs
- Troubleshooting guide
- Tax law reference summaries

## 🔄 Maintenance & Updates

### Tax Law Updates
- Modular design for easy rate updates
- Configuration-driven tax tables
- Version tracking for historical calculations
- Clear documentation of law changes

### Code Structure
- Separation of tax logic from MCP implementation
- Easy-to-update tax rate constants
- Extensible design for new property types
- Clean interfaces between components

## ⚠️ Important Considerations

### Legal Compliance
- **Disclaimer**: Include clear disclaimers about professional tax advice
- **Accuracy**: Strive for accuracy but acknowledge limitations
- **Updates**: Plan for regular updates as tax laws change
- **Scope**: Focus on residential property; clearly state limitations

### Performance
- **Efficiency**: Optimize for fast calculations
- **Caching**: Cache tax rate tables and complex calculations
- **Memory**: Efficient memory usage for large datasets
- **Scalability**: Design for potential high-volume usage

### Security
- **Input validation**: Prevent injection attacks
- **Data handling**: Secure handling of financial data
- **Dependencies**: Regular security updates
- **Logging**: Appropriate logging without exposing sensitive data

## 🚀 Getting Started Checklist

- [ ] Set up TypeScript project with MCP SDK
- [ ] Implement core property and tax types
- [ ] Create basic tax calculation engine
- [ ] Implement MCP tool interfaces
- [ ] Add comprehensive input validation
- [ ] Write unit tests for core logic
- [ ] Create integration tests
- [ ] Add detailed error handling
- [ ] Write API documentation
- [ ] Create usage examples

## 📞 Support & Resources

- **Tax Law Reference**: `CAPITAL_GAINS_TAX_GUIDE.md`
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Korean Tax Law**: National Tax Service (https://nts.go.kr)
- **TypeScript Best Practices**: Follow official TypeScript guidelines

---

*This project aims to provide accurate tax calculations while maintaining clean, maintainable code. Always prioritize correctness and clarity over clever optimizations.*

