import React, { Component } from 'react';
export declare class ErrorScreenManager extends Component<{
    code?: number;
    reload?: (...args: any[]) => any;
    subtitle?: React.ReactChild;
    subtitleClass?: string;
    reloadClass?: string;
}> {
    getMessage(): JSX.Element | "Bad Request" | "Unauthorized" | "Not Found" | "Internal Server Error" | "Bad Gateway" | "Service Temporarily Unavailable";
    render(): JSX.Element;
}
export declare class ErrorScreenNotAuthorized extends Component<{
    subtitle: React.ReactChild;
    subtitleClass?: string;
}> {
    render(): JSX.Element;
}
