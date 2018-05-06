# Test Documentation
For running tests, please read the scripts part of README.md file.

### Backend
Backend testing focuses on API testing. Quests, Groups, Users and Courses are tested with Jest/Superjest (automated) for crucial
CRUD functionality, correct user rights validation and formatting as frontend is programmed to use API. Moreover both Postman and JSRest have been constantly used during the programming of the backend. Backend testing is configured to use separate database with staging and developement, tests are designed to be indifferent from the starting state of the database, as tests will clear database before basing the pre-data into the test-database. Tests use various test-helper functions to check the test-database state to be as desired. Due the lack of time, newest API additions like Feedbacks are still without automated tests and adding these would be natural next step.

### Frontend
Frontend lacks automated testing mainly due priorisation of other tasks within tight time schedule. Towards the end there was half hearted attempt to start automated tests, but it was canceled as more urgent tasks emerged. However frontend have been tested extensively by means of manual testing, both by the creators and the customer as well as demo audience and other individuals in various circumtances in different locations with different internet connections and devices with various internet browsers and versions.
