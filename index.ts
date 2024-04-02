import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import shell from 'shelljs';
import {decodeModule} from "./openai";

const argv = yargs(hideBin(process.argv))
    .option('account', {
        alias: 'a',
        type: 'string',
        description: 'Account address',
        requiresArg: true,
    })
    .option('package', {
        alias: 'p',
        type: 'string',
        description: 'Package name',
        requiresArg: true,
    })
    .option('url', {
        alias: 'u',
        type: 'string',
        description: 'RPC URL',
        default: 'https://fullnode.mainnet.aptoslabs.com'
    })
    .parseSync();

// check if the aptos command is installed
// if not, install it
// if it is, upgrade it
if (!shell.which('aptos')) {
    shell.echo('Sorry, this script requires the Aptos CLI to be installed.');
    shell.echo('Installing Aptos CLI...');
    shell.exec('brew install aptos')
    shell.echo('aptos CLI installed');
    shell.exec('aptos --version');
} else {
    shell.echo('Upgrading the Aptos CLI...');
    shell.exec('brew upgrade aptos')
    shell.echo('Aptos CLI upgraded');
}

// update the aptos decompiler
shell.echo('Updating the Aptos decompiler...');
shell.exec("aptos update revela")
shell.echo('Updated the Aptos decompiler');

// download the bytecode for the module
const accountAddress = argv.account;
const packageName = argv.package;

if(!accountAddress || !packageName) {
    shell.echo('Please provide the account address and the package name');
    process.exit(1);
}

// delete the directory if it already exists
shell.rm('-rf', packageName);

const rpcUrl = argv.url;
shell.echo('Downloading the bytecode for the package...');
shell.exec(`aptos move download --account ${accountAddress} --bytecode --package ${packageName} --url ${rpcUrl}`);
shell.echo('Downloaded the bytecode for the package');

shell.echo('You successfully downloaded the following modules:');
shell.exec(`ls ${packageName}/bytecode_modules`)

// decompile the package
shell.echo('Decompiling the package...');
shell.exec(`aptos move decompile --package-path ${packageName}/bytecode_modules`);

// extract all the file names in the ${packageName}/bytecode_modules directory that have .move as the extension
// into an array of strings
shell.echo('The decompiled modules are:');
const decompiledModuleNames = shell.exec(`ls ${packageName}/bytecode_modules/*.move`, {silent: true})
    .stdout.split('\n').filter((name) => name !== '');
console.log(decompiledModuleNames);

// extract all of the text from the .move files into an array of strings
shell.echo('The content of the decompiled modules is:');
const decompiledModules = decompiledModuleNames.map((name) => shell.cat(name).stdout);
console.log(decompiledModules.length);
console.log(decompiledModules);

(async () => {
    shell.rm('-rf', `${packageName}/sources`)
    shell.mkdir('-p', `${packageName}/sources`);
    decompiledModules.map(async (decompiledModule, index) => {
        console.log(`Decoding module ${decompiledModuleNames[index]}:`);
        const decompiledCode = await decodeModule(decompiledModule, decompiledModules.filter((_, i) => i !== index));
        console.log(`Decoded module ${decompiledModuleNames[index]}:`)
        const cleanedCode = decompiledCode.replace(/```move/g, '').replace(/```/g, '');
        const moduleName = decompiledModuleNames[index].split('/')[2].split(".")[0];
        shell.touch(`${packageName}/sources/${moduleName}.move`);
        shell.ShellString(cleanedCode).to(`${packageName}/sources/${moduleName}.move`);
    });
})();