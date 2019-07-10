// @flow

import * as React from 'react';
import {Page} from './createPage';
import { runConforms } from './runConforms';
import {createEvent} from './event';
import type {ViewData} from './historyBlock';

type DialogProps = {
    views: $ReadOnlyArray<ViewData>,
    onChange: (number) => void,
    hideAnswer: boolean,
    onSelect: string => void,
}
const Dialog = ({views, onChange, hideAnswer, onSelect}: DialogProps) => views.map((v, idx) => {
    const Component = v.getRenderComponent();

    function onClick() {
        onChange(idx);
    }

    return <Component key={idx} onAnswerClick={onClick} hideAnswer={idx === views.length - 1 ? hideAnswer : false} onSelectElement={onSelect} />
});

type Props<TProps> = {
    page: Page<TProps>,
}

type ParseInputType<T> =
    | React.ComponentType<T>
    | {
        component: React.ComponentType<T>,
        props: T,
    }
// TODO: fix typings
function createComponent(obj: ParseInputType<any>): React.ComponentType<any> {
    if (typeof obj === 'object') {
        return props => React.createElement(obj.component, obj.props, null)
    }
    return obj
}

export const ConformsForm = <TProps: {}>({page}: Props<TProps>) => {
    const [views, setViews] = React.useState<$ReadOnlyArray<ViewData>>([]);
    const [savedViews, setSavedViews] = React.useState<$ReadOnlyArray<ViewData> | null>(null);
    const [, setKey] = React.useState<number>(0);
    const [value, setValue] = React.useState<string>('');
    const [stopped, setStopped] = React.useState<boolean>(false)

    React.useLayoutEffect(() => {
        const notifyViewEvent = createEvent<ViewData>();
        const stopEvent = createEvent<void>()

        const unsubscribe = []
        unsubscribe.push(notifyViewEvent.watch(viewData => {
            setViews(old => old.concat(viewData));
        }))
        unsubscribe.push(stopEvent.watch(() => {
            setStopped(true)
        }))

        runConforms(page, {
            notifyView: notifyViewEvent,
            stopEvent,
        });

        return () => {
            unsubscribe.forEach(e => e())
        }
    }, []);
    
    function reload() {
        setKey(key => key + 1);
    }

    const onChange = React.useCallback((id) => {
        setViews(old => {
            setSavedViews(oldSavedViews => {
                if (oldSavedViews == null) {
                    return old;
                }

                return oldSavedViews;
            })
            let done = false;
            const ans = [];
            for (let i = 0; i < old.length && !done; ++i) {
                ans.push(old[i]);
                done = i === id;
            }
            return ans;
        })
    });

    const onSubmit = React.useCallback(() =>  {
        setSavedViews(oldSavedViews => {
            if (oldSavedViews != null) {
                setViews(oldSavedViews);
                return null;
            }
            return oldSavedViews;
        })
    });

    const submit = React.useCallback(() => {
        views[views.length - 1].setAnswer(value);
        onSubmit();
        reload();
    });

    if (views.length === 0) {
        return null;
    }

    const currentView = views[views.length - 1];
    const Input = createComponent(currentView.Input);
    return <>
        <Dialog views={views} onChange={onChange} hideAnswer={savedViews != null} onSelect={setValue} />
        {!stopped && <Input onChange={setValue} onSubmit={submit} value={value} />}
    </>
}