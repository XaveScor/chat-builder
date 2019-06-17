// @flow

import * as React from 'react';
import type {SchemeF} from './types';
import { runConforms } from './runConforms';
import {createEvent} from './event';
import type {ViewData} from './historyBlock';

type DialogProps = {
    views: $ReadOnlyArray<ViewData>,
    onChange: (number) => void,
    hideAnswer: boolean,
    onSelect: any => void,
}
const Dialog = ({views, onChange, hideAnswer, onSelect}: DialogProps) => views.map((v, idx) => {
    const Component = v.getRenderComponent();

    function onClick() {
        onChange(idx);
    }

    return <Component key={idx} onAnswerClick={onClick} hideAnswer={idx === views.length - 1 ? hideAnswer : false} onSelectElement={onSelect} />
});

type Props = {
    scheme: SchemeF,
}

export const ConformsForm = ({scheme}: Props) => {
    const [views, setViews] = React.useState<$ReadOnlyArray<ViewData>>([]);
    const [savedViews, setSavedViews] = React.useState<$ReadOnlyArray<ViewData> | null>(null);
    const [, setKey] = React.useState<number>(0);
    const [value, setValue] = React.useState<string>('');

    React.useEffect(() => {
        const notifyViewEvent = createEvent<ViewData>();
        runConforms(scheme, {
            notifyView: notifyViewEvent,
        });

        return notifyViewEvent.watch(viewData => {
            setViews(old => old.concat(viewData));
        });
    }, []);

    if (views.length === 0) {
        return null;
    }
    
    function reload() {
        setKey(key => key + 1);
    }

    function onChange(id) {
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
    }

    function onSelect(data) {
        setValue(data);
    }

    function onSubmit() {
        setSavedViews(oldSavedViews => {
            if (oldSavedViews != null) {
                setViews(oldSavedViews);
                return null;
            }
            return oldSavedViews;
        })
    }

    const currentView = views[views.length - 1];

    function changeValue(e: SyntheticInputEvent<>) {
        setValue(e.target.value);
    }

    function submit() {
        currentView.setAnswer(value);
        onSubmit();
        reload();
    }

    return <>
        <Dialog views={views} onChange={onChange} hideAnswer={savedViews != null} onSelect={onSelect} />
        <input value={value} onChange={changeValue} />
        <input type='submit' onClick={submit} />
    </>
}