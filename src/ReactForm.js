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

export const ConformsForm = <TProps: {}>({page}: Props<TProps>) => {
    const [views, setViews] = React.useState<$ReadOnlyArray<ViewData>>([]);
    const [savedViews, setSavedViews] = React.useState<$ReadOnlyArray<ViewData> | null>(null);
    const [, setKey] = React.useState<number>(0);
    const [value, setValue] = React.useState<string>('');

    React.useLayoutEffect(() => {
        const notifyViewEvent = createEvent<ViewData>();

        const unsubscribe = notifyViewEvent.watch(viewData => {
            setViews(old => old.concat(viewData));
        });

        runConforms(page, {
            notifyView: notifyViewEvent,
        });

        return unsubscribe;
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

    const currentView = views[views.length - 1];

    const submit = React.useCallback(() => {
        currentView.setAnswer(value);
        onSubmit();
        reload();
    });

    if (views.length === 0) {
        return null;
    }

    const Input = currentView.Input;
    return <>
        <Dialog views={views} onChange={onChange} hideAnswer={savedViews != null} onSelect={setValue} />
        <Input onChange={setValue} onSubmit={submit} value={value} />
    </>
}