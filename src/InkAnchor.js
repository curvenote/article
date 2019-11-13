import { html } from 'lit-element';
import { BaseGetProps, propDef, getProp, setProp, getPropFunction } from './InkDynamicProps.js';

function isLinkExternal(url){
    return url && (url.startsWith('http') || url.startsWith('//'));
}

function transformToApiLink(url){
    //  Obviously needs an update at some point
    return '/api/bricks/rowan' + url;
}


class BaseVisible extends BaseGetProps {

    static get properties() {
        return {
            ...propDef('visible', Boolean),
            src: String,
            href: String,
            title: String,
            description: String,
            image: String,
            contain: Boolean,
        }
    }

    setDefaults(){
        this.visible = true;
        this.src = '';
        this.href = '';
        this.title = '';
        this.description = '';
        this.image = '';
        this.contain = false;
    }

    get visible() { return getProp(this, 'visible'); }
    set visible(val) { return setProp(this, 'visible', val); }
    get visibleFunction() { return getPropFunction(this, 'visible'); }

}

class InkAnchor extends BaseVisible {

    setFromSrc(){
        if(!this.src){
            return;
        }
        // TODO: don't load this again if it is the same
        // TODO: load when mouse over

        let apiSrc = transformToApiLink(this.src);

        fetch(apiSrc).then(data =>{
            data.json().then(json =>{
                this.href = '/' + json.uid;
                this.title = json.title;
                this.description = json.description;
                this.image = json.thumbnail;
                this.contain = json.thumbnail_contain;
            });
        });
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            switch (propName) {
                case 'src':
                    return this.setFromSrc();
                default:
                    return;
            }
        });
    }

    render() {
        return html`
        <style>
            a {
                color: #1E88E5;
                text-decoration: none;
                font-weight: 500;
            }
            a:hover{
                text-decoration: underline;
            }
            .container{
                display: inline;
                position: relative;
                top: 0;
                left:0;
            }
            .panel{
                display: none;
                position: absolute;
                background: #FFFFFF;
                top: calc(1em + 17px);
                left: calc(50% - 150px);
                width: 300px;

                border: 1px solid rgba(0, 0, 0, 0.1);
                background-color: rgba(250, 250, 250, 0.9);
                box-shadow: 0 0 7px rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                box-sizing: border-box;

                backdrop-filter: blur(1px);
                z-index: 100;
            }

            .panel img{
                width: 100%;
            }
            .container:hover > div{
                display: block;
            }

            .arrow {
                display: none;
                position: absolute;
                left: 50%;
                margin-left: -7px;
                top: calc(1em + 4px);
                clip: rect(0 18px 14px -4px);
                z-index: 101;
            }

            .arrow:after {
                content: '';
                display: block;
                width: 14px;
                height: 14px;

                border: 1px solid rgba(0, 0, 0, 0.1);
                background-color: rgba(250, 250, 250, 0.9);
                backdrop-filter: blur(1px);
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);

                transform: rotate(45deg) translate(6px,6px);
            }
        </style>
        <div class="container">
            <a
                ?hidden="${ !this.visible }"
                href="${ this.href }"
                target="${isLinkExternal(this.href)? '_blank' : '_self'}"
            ><slot></slot></a><div class="panel">
                <ink-card
                    title="${ this.title }"
                    description="${ this.description }"
                    img-src="${ this.image }"
                    ?contain="${ this.contain }"
                    url="${ this.href }"
                    width="280px">
                </ink-card>
        </div><div class="arrow"></div></div>`;
    }
}
customElements.define('ink-a', InkAnchor);

export { InkAnchor, isLinkExternal };
