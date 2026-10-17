# CarbonLedger --- Frontend

React + Vite + Tailwind CSS frontend for the CarbonLedger
carbon-accounting prototype.

## Project links

-   **Live application:** https://carbon-frontend-zr8y.vercel.app/
-   **Frontend repository:**
    https://github.com/Ramchandra-18/carbon-frontend
-   **Backend repository:**
    https://github.com/Ramchandra-18/carbon-backend
-   **Backend base URL:** https://carbon-backend-xhmi.onrender.com
-   **Swagger UI:**
    https://carbon-backend-xhmi.onrender.com/swagger-ui/index.html
-   **OpenAPI JSON:**
    https://carbon-backend-xhmi.onrender.com/v3/api-docs

## Purpose

CarbonLedger is a full-stack carbon-accounting prototype intended to
record emissions across a product supply chain and show organization,
stakeholder, stage, and product/batch footprint information. The
assignment calls for Scope 1, Scope 2, and all 15 Scope 3 category
options, factor provenance, product-stage traceability, role-based
access control, and reconciled totals.

**Important:** This README describes the intended project scope. Before
submission, update the implementation-status section below to reflect
what is actually working in the deployed build. Do not imply that a
feature is complete solely because it is part of the assignment.

## Technology

-   React
-   Vite
-   Tailwind CSS
-   Axios for HTTP requests
-   React Router, where used
-   Vercel deployment

## Architecture

``` text
Browser
  |
  v
React + Vite + Tailwind CSS
  |
  | HTTPS REST API
  v
Spring Boot backend
  |
  v
MySQL database
```

The frontend API base URL should point to the backend API prefix,
including `/api`.

## Run locally

### Prerequisites

-   Node.js and npm
-   Git
-   Access to the CarbonLedger backend, either locally or deployed

### 1. Clone and install

``` bash
git clone https://github.com/Ramchandra-18/carbon-frontend.git
cd carbon-frontend
npm install
```

### 2. Configure the API URL

Create a local `.env` file in the project root:

``` env
VITE_API_BASE_URL=http://localhost:8081/api
```

For the deployed backend, the value is:

``` env
VITE_API_BASE_URL=https://carbon-backend-xhmi.onrender.com/api
```

Set the corresponding variable in Vercel project settings and redeploy
after changing it. Vite variables are exposed to the browser bundle;
never place passwords, private keys, or API secrets in `VITE_*`
variables.

### 3. Start development server

``` bash
npm run dev
```

Vite prints the local URL, commonly `http://localhost:5173/`.

### 4. Build and preview

``` bash
npm run build
npm run preview
```

The production build is normally generated in `dist/`.

## API integration

The deployed OpenAPI document currently lists these frontend-relevant
routes:

  --------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                 Purpose
  ----------------------- -------------------------------------------------------- -----------------------
  POST                    `/api/auth/login`                                        Log in

  POST                    `/api/auth/register`                                     Register a user

  GET                     `/api/auth/me`                                           Retrieve current-user
                                                                                   information

  GET                     `/api/public/organizations`                              List active
                                                                                   organizations

  GET                     `/api/emission-factors`                                  List active emission
                                                                                   factors

  GET                     `/api/products/organization/{organizationId}`            List products for an
                                                                                   organization

  GET                     `/api/emissions-summary/organization/{organizationId}`   Retrieve an
                                                                                   organization's
                                                                                   emissions summary
  --------------------------------------------------------------------------------------------------------

The full, current endpoint and schema list is available in [Swagger
UI](https://carbon-backend-xhmi.onrender.com/swagger-ui/index.html) and
the [OpenAPI
JSON](https://carbon-backend-xhmi.onrender.com/v3/api-docs).

## Assessment workflow to demonstrate

Use the actual deployed UI and update this section with the screens and
workflow that are implemented.

1.  Sign in with an authorized demo account.
2.  Select or view the relevant organization.
3.  Select or create a product and batch, where implemented.
4.  Enter activity data and select an emission factor, where
    implemented.
5.  Review activity emissions and any stage or product summary that the
    application currently provides.
6.  Verify that a user cannot access another organization's restricted
    data.
7.  Record any missing or unavailable data rather than treating it as
    zero.

## Assignment coverage and implementation status

The assignment asks for:

-   Scope 1 activity types, including stationary/mobile combustion and
    process/fugitive emissions.
-   Scope 2 purchased electricity, steam, heating and cooling, with
    location-based and market-based results kept separate when valid
    factors exist.
-   All 15 Scope 3 categories, each marked applicable, not applicable,
    or data unavailable with a reason.
-   Ordered product stages and stakeholder contributions, linked
    transfers, batches, and shipment legs.
-   Factor provenance and reproducible selection metadata.
-   Reconciled stage, batch, and product totals without double counting.
-   Role-specific UI behavior backed by backend authorization.
-   Postman, Swagger/OpenAPI, tests, and an application working
    document.

Fill in the following table from your own verification before sending
the repository to the evaluator:

  ----------------------------------------------------------------------------------------------------------
  Area                    Verified status                            Evidence / limitation
  ----------------------- ------------------------------------------ ---------------------------------------
  Sign-in and             `[Complete / Partial / Not implemented]`   `[Add route or screenshot reference]`
  role-specific                                                      
  navigation                                                         

  Scope 1 and Scope 2     `[Complete / Partial / Not implemented]`   `[List working cases]`
  input workflows                                                    

  All 15 Scope 3 category `[Complete / Partial / Not implemented]`   `[List missing options or data gaps]`
  options                                                            

  Factor source and       `[Complete / Partial / Not implemented]`   `[Show fields and source reference]`
  selection metadata                                                 

  Product journey and     `[Complete / Partial / Not implemented]`   `[Show one tested batch]`
  stage contributions                                                

  Reconciled total and    `[Complete / Partial / Not implemented]`   `[Provide calculation evidence]`
  double-count prevention                                            

  Cross-organization      `[Pass / Fail / Not tested]`               `[Link test result]`
  access denial                                                      
  ----------------------------------------------------------------------------------------------------------

## Security

-   Do not commit `.env` files or credentials.
-   Demo credentials should be shared with the evaluator through an
    appropriate private channel, not stored in this README.
-   Frontend route hiding is not a security boundary; authorization must
    be enforced by the backend.
-   Do not expose private secrets in browser environment variables.

## Related documentation

-   [Backend README](https://github.com/Ramchandra-18/carbon-backend)
-   [Swagger
    UI](https://carbon-backend-xhmi.onrender.com/swagger-ui/index.html)
-   [OpenAPI JSON](https://carbon-backend-xhmi.onrender.com/v3/api-docs)
-   [Live application](https://carbon-frontend-zr8y.vercel.app/)

## Known limitations

Add current deployed limitations here with the observed behavior,
evidence, and impact. Distinguish unavailable factors from zero
emissions and distinguish an incomplete footprint from a complete
inventory.

------------------------------------------------------------------------

CarbonLedger --- Java Full Stack Developer Intern assignment prototype.
