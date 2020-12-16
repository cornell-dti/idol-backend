const dirPath: string = __dirname + '/static/memberJSON/';

export let getFilePath = function (email: string): string {
    var pos = email.indexOf('@');
    var path = dirPath + email.slice(0, pos) + '.json';
    return path;
}