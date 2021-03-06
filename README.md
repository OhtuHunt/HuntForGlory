# Hunt For Glory
### Travis [![Build Status](https://travis-ci.org/OhtuHunt/HuntForGlory.svg?branch=master)](https://travis-ci.org/OhtuHunt/HuntForGlory)

### Codecov [![codecov](https://codecov.io/gh/OhtuHunt/HuntForGlory/branch/development/graph/badge.svg)](https://codecov.io/gh/OhtuHunt/HuntForGlory)

### [Link to production](https://huntforglory.herokuapp.com/)

### [Product backlog](https://docs.google.com/spreadsheets/d/17PduZQHrmnuX6p_RP01JO7bq5TDrcI7-3gSi1h1wwI4/edit?ts=5a5c6da6#gid=0)

### [Drive-folder](https://drive.google.com/open?id=10lK1HtHSuotmiAjwj4vCeRSRPuYMGMyj)

### [Frontend repository](https://github.com/OhtuHunt/HuntForGloryFrontend)

### [Documentation](https://github.com/OhtuHunt/HuntForGlory/blob/development/Documentation)

### Technology

Frontend is implemented with ReactJS, while backend uses Node.js.

### Running the app locally
1. Clone the repository with `git clone git@github.com:OhtuHunt/HuntForGlory.git`.
2. Change to the directory with `cd HuntForGlory/`.
3. Install the dependencies with `npm install`.
4. Add .env file to contain your environment variables, see below.
5. Run the app with `npm start`.

### Configuration

Environment variables:

| Variable  | Description |
| ------------- | ------------- |
| DATABASE_URL  | Address of database, e.g. `mongodb://USERNAME:PASSWORD@dsNUMBER.mlab.com:PORT/DATABASE` |
| PORT | Port used by the backend server |
| NODE_ENV | Node environment, value can be `production`, `development` or `test`. |

### Scripts (standard scripts excluded)

Backend:
"watch": Runs the application within development environment.
"test": Runs the automated Jest-tests within test environment, configured with verbose to run in sequence.
"localDev": Runs the application within development enviroment where REACT_APP_LOCAL variable is true.

Frontend: (all build scripts include configured terminal command for moving build files into backend repository)
"build": Standard build with production as base url
"buildDev": Build with development environment and staging as base url
"buildLocal": Build with development environment and REACT_APP_LOCAL true.
"buildAll": runs all the build scripts above


### Authentication

Application uses [TMC-authentication](https://tmc.mooc.fi) to identify users. Therefore, you need to register to tmc in order to use the application. Authorization is done with OAuth2.

### [Deploying to heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction)

### License
Copyright 2018 OhtuHunt

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
