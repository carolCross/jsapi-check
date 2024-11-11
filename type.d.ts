import { Position } from "vscode";
import { Expression } from '@babel/types';

declare global {
    /** 命令 */
    type PackageCommandType = {
        /** 命令名称 */
        title: string,
        /** 命令code */
        command: string
    }
    /** CalleeType */
    type CalleeType = {
        node: {
            callee: {
                object: {
                    name?: string
                },
                property: {
                    name?: string
                }
            } & Expression
        }
    } | any
    
    
    /**
     * code 位置信息
     */
    type CodePoi = {
        /** start poi */
        start: {
            /** start  x mean line Index */
            x: number,
            /** start  y mean string length  */
            y: number,
        },
         /** end poi */
        end: {
            /** start  x mean line Index */
            x: number,
            /** start  y mean string length  */
            y: number,
        }
    } 
}