import { db } from './firebase';
import { Request, Response } from 'express';
import { Member } from '../src/DataTypes';
import { ErrorResponse, MemberResponse, ImageResponse } from '../src/APITypes';
import { getFilePath } from './utils'

const fs = require('fs');

export let reduceMessage = async function (req: Request, res: Response): Promise<MemberResponse | ImageResponse | ErrorResponse> {
    if (!req.body.member) {
        return {
            status: 400,
            error: "Couldn't update member with undefined data or undefined image"
        };
    }
    if (req.body.member) {
        let member: Member = req.body.member;
        if (!member.email || member.email === '') {
            return {
                status: 400,
                error: "Couldn't update member with undefined email!"
            };
        }
        fs.writeFile(getFilePath(member.email), JSON.stringify(req.body.member), function (err) {
            if (err) {
                return {
                    status: 500,
                    error: "Couldn't update member with email " + member.email
                };
            }
        });
        return {
            status: 200,
            member: req.body.member
        };
    }
}