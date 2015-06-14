"use strict";

var ChildProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var configuration = require('./configuration.js');
var serverPath = path.resolve(__dirname , './agent/agentServer.js');

function AgentProcess () {
    

    this.start = function () {
        
        var pid = null;
        var childProcess = null;

        if (configuration.authKey == null || configuration.authKey == '') {
            console.log('You must first register this agent before it can be started.');
            return;
        }
        
        try {
            var pid = fs.readFileSync(configuration.agentPidFilePath, { encoding: 'utf8' });
            console.log('You must first stop currently running agent.');
            return;
        }
        catch (exception) {
            
        }

        console.log('Starting agent..');

        var out = fs.openSync(configuration.logFilePath, 'a');
        var err = fs.openSync(configuration.logFilePath, 'a');
        
        childProcess = ChildProcess.spawn('node', [serverPath], {detached: true, stdio: ['ignore', out, err] , execArgv: [] });
        
        pid = childProcess.pid;
        fs.writeFileSync(configuration.agentPidFilePath, pid);

        childProcess.unref();
        childProcess = null;
        
        console.log('Agent started with pid: ' + pid);

        return pid;
    };

    this.stop = function () {
        var pid = null;
        
        console.log('Stopping agent...');

        try {
            var pid = fs.readFileSync(configuration.agentPidFilePath, { encoding: 'utf8' });
        }
        catch (exception)  {
            console.log('Could not open pid file: ' + configuration.agentPidFilePath);
        }
        
        try {
            
            if(pid != null)
                process.kill(pid,'SIGTERM');
        }
        catch (exception) {
            console.log('Could not kill process with pid: ' + pid);
        }
        
        try {
            if (pid != null)
                fs.unlinkSync(configuration.agentPidFilePath);
        }
        catch (exception) {
        
        }

        console.log('Agent stopped.')
    };

 
};

module.exports = AgentProcess;


