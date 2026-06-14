You are a senior staff-level software engineer and product designer.

Build a production-ready web application called "HomeStock AI".

HomeStock AI is a household inventory management platform that helps families track home supplies, predict shortages, and manage shopping lists collaboratively.

The goal is:

"Know what is in your house, what is running low, and what needs to be purchased."

The application should be designed as a modern SaaS product with clean UX similar to Linear, Notion, and Apple Home.

==================================================
TECH STACK
==================================================

Frontend:
- React 19
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query
- React Router
- Zustand

Backend:
- Node.js
- Express
- TypeScript

Database:
- PostgreSQL

ORM:
- Prisma

Authentication:
- JWT
- Email Login

File Storage:
- Local storage abstraction layer
- Future-ready for S3

AI:
- OpenAI API abstraction service

==================================================
PRODUCT OVERVIEW
==================================================

Users can create a household.

A household contains:

- Members
- Inventory
- Shopping Lists
- Consumption Data
- Notifications

Multiple family members can join the same household.

All inventory is shared.

==================================================
FEATURE SET
==================================================

# FEATURE 1
HOUSEHOLD MANAGEMENT

Users can:

- Create Household
- Invite Members
- Remove Members
- Transfer Ownership

Roles:

Owner
Admin
Member

Database:

Household
HouseholdMember

==================================================

# FEATURE 2
INVENTORY MANAGEMENT

Inventory Item Fields:

id
householdId

name
brand

category

quantity

unit

location

barcode

image

minimumThreshold

createdAt
updatedAt

Categories:

Food
Beverage
Cleaning
Laundry
Bathroom
Pet
Kitchen
Medicine
Other

Locations:

Kitchen
Fridge
Freezer
Bathroom
Laundry Room
Storage Room
Garage
Custom

Users can:

Create Item

Edit Item

Delete Item

Adjust Quantity

Move Location

Archive Item

==================================================

# FEATURE 3
SHARED SHOPPING LIST

Shopping List Item Fields:

name
quantity
unit
priority
status

Status:

Pending
Purchased

Features:

Create Shopping Item

Mark Purchased

Assign User

Sort By Priority

Realtime Sync

==================================================

# FEATURE 4
LOW STOCK ALERTS

Users can define:

minimumThreshold

Example:

Toilet Paper
Current: 4 rolls

Minimum: 6 rolls

System generates alert.

Alert Types:

Low Stock
Out of Stock

==================================================

# FEATURE 5
CONSUMPTION TRACKING

Track inventory changes.

Example:

Toilet Paper

24 rolls
Purchased on May 1

Reached 0 on June 10

System calculates:

Usage Duration

Average Daily Consumption

Projected Depletion Date

Create consumption engine.

==================================================

# FEATURE 6
PREDICTIVE REFILL ENGINE

Core Feature.

For every item:

Calculate:

averageConsumptionRate

remainingDays

predictedOutDate

Formula:

remainingDays =
currentQuantity / averageDailyConsumption

Show:

"Toilet Paper will likely run out in 8 days."

Dashboard should prioritize these alerts.

==================================================

# FEATURE 7
AI ASSISTANT

Chat interface.

Examples:

"What is running low?"

"What should I buy this week?"

"Do we have enough toilet paper?"

"What items are likely to run out next week?"

AI should use household inventory data.

Create service architecture:

AIService
PromptBuilder
Tool Layer

Future-ready for function calling.

==================================================

# FEATURE 8
RECEIPT SCANNER

Upload receipt image.

OCR extract:

Product Name

Quantity

Price

Return parsed list.

User reviews before import.

Architecture:

ReceiptUpload

OCR Service

Review Screen

Import Screen

==================================================

# FEATURE 9
BARCODE SCANNER

Using mobile camera.

Scan barcode.

Flow:

Scan

Lookup Product

Autofill Form

If product not found:

Create Custom Product

Database:

Barcode Mapping Table

==================================================

# FEATURE 10
VOICE INPUT

User can say:

"Bought 2 packs of toilet paper."

"Added cat food."

Convert speech to text.

AI extracts:

item
quantity
unit

Show confirmation screen.

==================================================
DASHBOARD
==================================================

Home Dashboard contains:

1. Inventory Summary

Total Items

Categories

Locations

2. Low Stock Items

3. Predicted Out Soon

4. Shopping List

5. AI Insights

Examples:

"3 items may run out this week."

"You spent most on pet supplies."

==================================================
UI REQUIREMENTS
==================================================

Design system:

Modern
Minimal
Apple-inspired

Use:

White backgrounds

Soft shadows

Large spacing

Rounded corners

Excellent mobile experience

Mobile-first responsive design.

Create:

Dashboard

Inventory Page

Item Details

Shopping List

Household Settings

Notifications

AI Chat

Receipt Scanner

Barcode Scanner

Voice Input

==================================================
DATABASE SCHEMA
==================================================

Generate complete Prisma schema.

Include:

User

Household

HouseholdMember

InventoryItem

InventoryAdjustment

ShoppingListItem

ConsumptionRecord

Notification

BarcodeProduct

ReceiptImport

==================================================
API
==================================================

Generate REST API.

Include:

Authentication

Inventory CRUD

Shopping List CRUD

Household CRUD

Notifications

Consumption Analytics

AI Endpoints

Receipt Processing

Barcode Lookup

Voice Processing

==================================================
DELIVERABLES
==================================================

Generate:

1. Folder structure

2. Database schema

3. Backend architecture

4. Frontend architecture

5. API routes

6. Type definitions

7. UI wireframes

8. Core React pages

9. Zustand stores

10. Prisma schema

11. Predictive refill engine

12. AI assistant architecture

13. Implementation roadmap

Write production-quality code with strong separation of concerns and scalability.