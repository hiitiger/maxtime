import * as React from "react";

export interface IProps {
    title: string;
    product: string;
    path: string;
}

export default class AppProcessInfo extends React.Component<
    Partial<IProps>,
    {}
> {
    public render() {
        return (
            <div>
                <h1>
                    App {this.props.title} {this.props.product}!
                </h1>
                <h2>{this.props.path}</h2>
            </div>
        );
    }
}
