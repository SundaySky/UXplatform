@Library('jenkins-utils') _

def jobName = env.JOB_NAME
println "jobName: ${jobName}"
def buildNumber = env.BUILD_NUMBER.toInteger()
println "buildNumber: ${buildNumber}"

common.stopPreviousBuild(jobName, buildNumber)

pipeline {
    agent { label 'ssky-amazon-linux-2023-prod-ecs' }
    tools {nodejs 'nodejs22' }
    options {
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
    }

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        PATH = "node_modules/.bin:$PATH"
        NPM_TOKEN = credentials('NPM_TOKEN_DNA')
        FONTAWESOME_TOKEN = credentials('FONTAWESOME_TOKEN')
        NODE_OPTIONS = '--max_old_space_size=8192 --unhandled-rejections=warn'
        FORCE_COLOR = 'false'
    }

    stages {
        stage('Test') {
            steps {
                sh '''
                npm ci
                npm run eslint
                npm run type-check
                npm run test
                npm run build
                '''
            }
        }
    }
    post {
        always {
            echo 'Cleaning workspace'
            cleanWs notFailBuild: true
        }
    }
}
