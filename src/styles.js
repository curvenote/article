import { html } from 'lit-element';

var katexCSS = html`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.css" integrity="sha384-xNwWFq3SIvM4dq/1RUyWumk8nj/0KFg4TOnNcfzUU4X2gNn3WoRML69gO7waf3xh" crossorigin="anonymous">`;

var bricksTheme = html`
<style type="text/css">
  a {
    color: #1E88E5;
    text-decoration: none;
    font-weight: 500;
  }
  a:hover{
    text-decoration: underline;
  }

  h1, h2, h3, h4, h5{
    font-family: 'Oswald', sans-serif;
  }

  code{
    border-radius: 15px;
    border: 1px solid #E4E4E4;
    background-color: #FAFAFA;
    padding: 0 5px;
  }
  h1:first-of-type{
    border-bottom: 1px solid #333;
  }
  blockquote{
    padding: 10px 20px;
    margin: 20px 0;
    border-left: 5px solid #eee;
    color: #31708f;
    font-size: 17.5px;
    font-weight: 300;
    line-height: 1.25;
    text-align: justify;
  }

  dl dt{
    float: left;
    width: 160px;
    overflow: hidden;
    clear: left;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  dl dd{
    margin-left: 180px;
  }
  p {
    text-align: justify;
  }
  emph {
    font-style: italic;
  }
  strong {
      color: black;
  }
  .ink-drag-horz{
    cursor: col-resize;
  }
</style>
`;

export { katexCSS, bricksTheme };
