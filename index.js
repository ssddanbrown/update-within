#!/usr/bin/env node

const fs = require('fs');
const inputArgs = require('minimist')(process.argv.slice(2));
const defaultArgs = {
    _: [],
    boundary: '<!-- UPDATE: {key} -->',
};
const args = Object.assign({}, defaultArgs, inputArgs);
const files = args._;

if (files.length < 2) {
    return failOut(`At least two files need to be provided, with the first being the model file to read and any more being the files to replace within. ${files.length} file(s) provided.`);
}

const nonExistentFiles = files.filter(file => !fs.existsSync(file));
if (nonExistentFiles.length > 0) {
    return failOut(`The following provided file(s) could not be found: ${nonExistentFiles.join(', ')}`);
}

const modelFile = files[0];
const replaceFiles = files.slice(1);

const modelContent = readModelContentFromFile(modelFile, args.boundary);
let totalChanges = 0;
for (const file of replaceFiles) {
    const changes = replaceContentUsingModelMap(file, modelContent, args.boundary);
    totalChanges += changes;
}

console.info(`Made ${totalChanges} changes across ${replaceFiles.length} files`);

/**
 * Replace content in the given file using the provided content map and boundary.
 * @param {String} file
 * @param {Map<string, string>} modelContent
 * @param {String} boundary
 */
function replaceContentUsingModelMap(file, modelContent, boundary) {
    let fileContent = fs.readFileSync(file, 'utf8');
    let changesMade = 0;

    for (const [key, sectionContent] of modelContent.entries()) {
        const keyBoundary = boundary.replace('{key}', key);
        const splitOnBound = fileContent.split(keyBoundary);
        if (splitOnBound.length < 3) continue;
        splitOnBound[1] = sectionContent;
        fileContent = splitOnBound.join(keyBoundary);
        changesMade++;
    }

    fs.writeFileSync(file, fileContent, 'utf8');
    return changesMade;
}

/**
 * Read the file at the given path and extract any model
 * sections within defined by the given boundary pattern.
 * @param {String} file
 * @param {String} boundaryPattern
 * @return {Map<string, string>}
 */
function readModelContentFromFile(file, boundaryPattern) {
    const modelContent = fs.readFileSync(file, 'utf8');
    const pattern = boundaryPattern.replace('{key}', '(.*?)');
    const allBoundary = new RegExp(pattern, 'g');
    const boundariesByKey = new Map();

    const boundaryMatches =  modelContent.matchAll(allBoundary);
    for (const match of boundaryMatches) {
        if (typeof match[0] === 'undefined') continue;
        boundariesByKey.set(match[1], match[0]);
    }

    const contentByKey = new Map();
    for (const [key, boundary] of boundariesByKey.entries()) {
        const splitByBound = modelContent.split(boundary);
        if (splitByBound.length < 3) continue;
        contentByKey.set(key, splitByBound[1]);
    }

    return contentByKey;
}

function failOut(msg) {
    console.error(msg);
    process.exit(0);
}