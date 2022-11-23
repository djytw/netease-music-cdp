async function test() {

    const cdp = require("chrome-remote-interface")
    const a = await cdp({host:"localhost",port:9222})
    await a.Page.enable()
    await a.DOM.enable()
    await a.CSS.enable()
    await a.Runtime.enable()
    const frame = await a.Page.getFrameTree();
    const {styleSheetId} = await a.CSS.createStyleSheet({frameId:frame.frameTree.frame.id})
    const location = {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0
    };
    
    await a.CSS.addRule({styleSheetId, ruleText: `
    .recommend-btn,
    .g-singlec-comment,
    .g-singlec-comment-detail,
    .g-singlec-comment-top,
    .g-singlec-live.j-flag,
    .recommend {
        display: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single .mn {
        height: calc(100vh - 150px) !important;
        width: 70% !important;
        max-width: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single .mn * {
        max-width: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .g-single-track .g-singlec-ct .n-single .mn .head {
        width: 100% !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single .sd {
        width: 30% !important;
        max-width: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .g-single-track .sd.j-flag {
        margin-top: calc(40px + 10vh);
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .g-single-track .g-singlec-ct .n-single .mn .head .inf .title h1 {
        font-size: calc(10vh - 30px) !important;
        -webkit-locale: 'ja-jp' !important;
        font-family: 'Gill Sans MT', 'Source Han Sans SC';
        font-weight: 200;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .g-single-track .content {
        max-width: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single {
        max-height: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .g-single-track .g-singlec-ct .n-single .mn .lyric {
        width: 100% !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single .cdwrap {
        -webkit-animation: none !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .cdrun {
        display: none;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .n-single .cdin, .n-single .cdimg {
        width: 100%;
        height: 100%;
        border-radius: 0px;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .j-line>p.lyric-next-p:first-child {
        font-size:32px !important;
        -webkit-locale: 'ja-jp' !important;
        font-family: "Gill Sans MT", "Klee One", "LXGW WenKai Screen R" !important;
        font-weight: 400 !important;
    }
    `, location});
    await a.CSS.addRule({styleSheetId, ruleText: `
    .j-line>p.lyric-next-p.translated {
        font-size:24px !important;
        -webkit-locale: 'zh-cn' !important;
        font-family: "Gill Sans MT", "LXGW WenKai Screen R" !important;
        font-weight: 400 !important;
    }
    `, location});

    while(true) {
        try {
            await inject(a);
        } catch(e) {
            console.log(e);
        }
        await check(a);
    }
}

async function check(a) {
    const browserCode = () => {
        return new Promise(resolve => {
            new MutationObserver((mutations, observer) => {
                if (mutations.flatMap(m=>[...m.addedNodes]).some(node => node.classList.contains("g-single"))) {
                    observer.disconnect();
                    resolve();
                }
            }).observe(document.body, {
                childList: true
            });
        });
    };
    await a.Runtime.evaluate({
        expression: `(${browserCode})()`,
        awaitPromise: true
    });
}

async function inject(a) {
    const {root} = await a.DOM.getDocument();
    const {nodeId} = await a.DOM.querySelector({selector:'img.j-flag', nodeId: root.nodeId});
    const {attributes} = await a.DOM.getAttributes({nodeId});
    console.log(attributes);
    let param = {nodeId, name: 'src', value: ''};
    for (let i = 0; i < attributes.length; i += 2) {
        if (attributes[i] === 'src') {
            param.value = attributes[i+1];
            break;
        }
    }
    param.value = param.value.replace(/&thumbnail=\d+y\d+/, '');
    a.DOM.setAttributeValue(param);
    a.DOM.on("attributeModified", param => {
        if (param.nodeId === nodeId && param.name === 'src') {
            const newvalue = param.value.replace(/&thumbnail=\d+y\d+/, '');
            if (newvalue !== param.value) {
                param.value = newvalue;
                console.log(param)
                a.DOM.setAttributeValue(param);
            }
        }
    })
    console.log("injected: " + nodeId);
}
test().then(() => {
    require('process').exit()
});
