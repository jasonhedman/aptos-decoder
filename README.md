# Aptos Decoder

The Aptos Decoder uses the Aptos Revela decompiler paired with OpenAI GPT-4 to provide insights into Aptos packages that do not publish their source code

The script first downloads the Aptos package from the Aptos repository, then decompiles the package using the Aptos Revela decompiler. 

The decompiled code is then passed to the OpenAI GPT-4 model, which substitutes the auto-generated variables names with semantically meaningful names. 

The output is a human-readable version of the Aptos package, which can be used to understand the functionality of the package without having access to the source code.

## Installation

Start by cloning the repository:

```bash
git clone https://github.com/jasonhedman/aptos-decoder
```

Then install the required dependencies:

```bash
npm install
# or
yarn install
```

## Setup

To use the Aptos Decoder, you will need to have an OpenAI API key. You can sign up for an API key [here](https://beta.openai.com/signup/).

Once you have your API key, create a `.env` file in the root directory of the project and add your API key:

```env
OPENAI_API_KEY=<your-api-key>
```

`.env.example` is provided as a template.


## Usage

To use the Aptos Decoder, run the following command:

```bash
yarn run compile
# or
npm run compile
```

Then run the node script with your desired package:

```bash
node index.js --account <account-address> --package <package-name>
```

The decoder will output the decompiled code into the `<package-name>/sources` directory.

## Configuration

The Aptos Decoder can be configured using the following command line arguments:

- `--account` (required): The account address of the Aptos package
- `--package` (required): The name of the Aptos package
- `--url`: A URL for an Aptos fullnode (default: `https://fullnode.mainnet.aptoslabs.com`)

## Operating System

The Aptos Decoder is currently only compatible with macOS, but will be expanded to support Windows and Linux in the future.
