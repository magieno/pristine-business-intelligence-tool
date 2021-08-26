import {AppModuleInterface} from "@pristine-ts/common";
import {AwsModule, SSMResolver} from "@pristine-ts/aws";
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
import {TeamController} from "./controllers/team.controller";
import {TeamManager} from "./managers/team.manager";
import {TeamMemberRepository} from "./repositories/team-member.repository";
import {PluralsightFlowUserController} from "./controllers/pluralsight-flow-user.controller";
import {PluralsightFlowManager} from "./managers/pluralsight-flow.manager";
import {PluralsightFlowUserRepository} from "./repositories/pluralsight-flow-user.repository";
import {ExtractionRequestManager} from "./managers/extraction-request.manager";
import {ExtractionRequestRepository} from "./repositories/extraction-request.repository";
import {ExtractionRequestController} from "./controllers/extraction-request.controller";
import {EnvironmentVariableResolver} from "@pristine-ts/configuration";

export const AppModuleKeyname = "pristine.starter";

export const AppModule: AppModuleInterface = {
    importServices: [
        // Controllers
        ExtractionRequestController,
        JiraUserController,
        PluralsightFlowUserController,
        TeamController,
        UserController,

        // Managers
        ExtractionRequestManager,
        JiraManager,
        PluralsightFlowManager,
        TeamManager,
        UserManager,

        // Repositories
        ExtractionRequestRepository,
        JiraUserRepository,
        PluralsightFlowUserRepository,
        TeamRepository,
        TeamMemberRepository,
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
        defaultResolvers: [
            new EnvironmentVariableResolver("DATABASE_HOST"),
        ],
    }, {
        parameterName: "mysql.username",
        defaultValue: "magieno",
        isRequired: false,
        defaultResolvers: [
            new EnvironmentVariableResolver("DATABASE_USERNAME"),
        ],
    }, {
        parameterName: "mysql.password",
        defaultValue: "magieno",
        isRequired: false,
        defaultResolvers: [
            new EnvironmentVariableResolver("DATABASE_PASSWORD"),
        ],
    }, {
        parameterName: "mysql.secret.arn",
        defaultValue: "",
        isRequired: false,
        defaultResolvers: [
            new EnvironmentVariableResolver("DATABASE_SECRET_ARN"),
        ],
    }, {
        parameterName: "mysql.database",
        defaultValue: "business_intelligence_tool",
        isRequired: false,
    },{
        parameterName: "pluralsight-flow.api-key",
        isRequired: true,
        defaultResolvers: [
            new EnvironmentVariableResolver("PLURALSIGHT_FLOW_API_KEY"),
            new SSMResolver("pluralsight-flow.api-key", "us-east-2", true),
        ]
    },
    ]
};
