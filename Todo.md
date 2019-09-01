# TODO List

## Back - End

### Setup

- [x] Setup Express
- [x] Setup MySQL
- [x] Add Visited Auction Table MxN User - Auction (bonus)
- [x] Design Database
- [x] DB Create Script
- [x] DB Fill Script
- [x] Setup Image requesting

### Features

- [x] Create Database Controller
- [x] Setup SSL encryption
  * [Article 1](https://hackernoon.com/set-up-ssl-in-nodejs-and-express-using-openssl-f2529eab5bb)
  * [Download SSL](https://www.openssl.org/source/)
- [x] XML -> DB generation
  - [x] Pass 1-2-3 Auction Ids
- [x] Search sql queries
- [x] Auction retrieval sql query
- [ ] Auction post sql query
- [x] Category Captions
- [ ] Category Filling
- [ ] Bonus algorithm (Recommended items)

## Front - End

### Setup

- [x] Create React app
- [x] Setup Router
- [x] Setup Sass
- [x] Test Bootstrap (Scrapped)
  - [x] Remove Bootstrap CDN and restyls
- [x] Integrate Material UI

### Components

- [x] Header
    - [x] Logo
    - [x] Search
      - [x] Implement Functionality
    - [x] Login
      - [x] Redo Popup with Dialog
    - [x] Account Snapshot
      - [x] Redo with Material UI
    - [x] Styling
- [x] Home Page
  - [x] Carousel
    - [x] Create custom carousel component
    - [ ] Experiment with colouring
  - [x] General Styling
  - [x] Popular / Recommended Grid
  - [x] Carousel Items Query
- [x] Signup
  - [x] [Countries](https://restcountries.eu/rest/v2/all)
  - [x] Styling
  - [x] Implementation
- [x] Search Results
  - [x] Collapsed
  - [x] Detailed
  - [x] Detailed Grid
  - [x] Collapsed Grid
  - [x] Square Grid (Scrapped)
  - [x] Pagination
  - [x] Redo with one button
- [ ] Account Page
  * Everybody
    - [ ] Profile
    - [ ] Posted Auctions
  * Logged User
    - [ ] Post Auction
    - [ ] Active Auctions
    - [ ] Messages
      - [x] DB redo -header -body
      - [x] Backend queries
      - [x] Received / Sent Sorting
      - [ ] Conversations Sorting
      - [ ] Notifications
      - [ ] Send
      - [ ] Reply
      - [ ] Delete Message
    - [ ] Settings
- [ ] Auction Page
  - [ ] View - Bid Auction
  - [x] Export to XML by admin
- [x] Admin Page
  - [x] Dashboard with options
  - [x] Login Routing
  - [x] Full User Data Display
  - [x] Sort by (Username, Status, Date of signup?)
  - [x] Search users by usermame
  - [x] Validate User
  - [x] Reject User
  - [x] View Auctions (Search, Sort)
    - [x] Select Auctions
    - [x] Export Selected auctions
      - [x] XMl
      - [x] JSON
- [ ] About Page
- [ ] Help Page

### Packages

* [Pagination](https://www.npmjs.com/package/react-paginate)
* [Map](https://react-leaflet.js.org/)
* [Router](https://blog.pshrmn.com/simple-react-router-v4-tutorial/)
