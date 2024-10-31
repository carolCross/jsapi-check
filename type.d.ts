import { Position } from "vscode";

declare global {
    /** 命令 */
    type PackageCommandType = {
        /** 命令名称 */
        title: string,
        /** 命令code */
        command: string
    }
    
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