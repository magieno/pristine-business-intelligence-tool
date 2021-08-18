import {AppModuleInterface} from "@pristine-ts/common";
import {AwsModule} from "@pristine-ts/aws";
import {NetworkingModule} from "@pristine-ts/networking";
import {CoreModule} from "@pristine-ts/core";
import {LoggingModule} from "@pristine-ts/logging";
import {SecurityModule} from "@pristine-ts/security";
import {TelemetryModule} from "@pristine-ts/telemetry";
import {RedisModule} from "@pristine-ts/redis";
import {ValidationModule} from "@pristine-ts/validation";
import {AwsXrayModule} from "@pristine-ts/aws-xray";
import {Auth0Module} from "@pristine-ts/auth0";
import {HttpModule} from "@pristine-ts/http";
import {StripeModule} from "@pristine-ts/stripe";
import {UserRepository} from "./repositories/user.repository";
import {UserManager} from "./managers/user.manager";
import {UserController} from "./controllers/user.controller";
import {JiraUserController} from "./controllers/jira-user.controller";
import {JiraManager} from "./managers/jira.manager";
import {JiraUserRepository} from "./repositories/jira-user.repository";
import {TeamRepository} from "./repositories/team.repository";

export const AppModuleKeyname = "pristine.starter";

export const AppModule: AppModuleInterface = {
    importServices: [
        // Controllers
        JiraUserController,
        UserController,

        // Managers
        JiraManager,
        UserManager,

        // Repositories
        JiraUserRepository,
        TeamRepository,
        UserRepository,
    ],
    importModules: [
        AwsModule,
        CoreModule,
        HttpModule,
        LoggingModule,
        NetworkingModule,
        SecurityModule,
        ValidationModule,
        TelemetryModule,
    ],
    keyname: AppModuleKeyname,
    configurationDefinitions: [{
        parameterName: "mysql.host",
        defaultValue: "localhost",
        isRequired: false,
    }, {
        parameterName: "mysql.user",
        defaultValue: "magieno",
        isRequired: false,
    }, {
        parameterName: "mysql.password",
        defaultValue: "magieno",
        isRequired: false,
    }, {
        parameterName: "mysql.database",
        defaultValue: "business_intelligence_tool",
        isRequired: false,
    },
    ]
};
