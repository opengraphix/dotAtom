(function() {
  var MarkdownPreviewView, fs, isMarkdownPreviewView, mathjaxHelper, renderer, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  fs = require('fs-plus');

  MarkdownPreviewView = null;

  renderer = null;

  mathjaxHelper = null;

  isMarkdownPreviewView = function(object) {
    if (MarkdownPreviewView == null) {
      MarkdownPreviewView = require('./markdown-preview-view');
    }
    return object instanceof MarkdownPreviewView;
  };

  module.exports = {
    config: {
      breakOnSingleNewline: {
        type: 'boolean',
        "default": false,
        order: 0
      },
      liveUpdate: {
        type: 'boolean',
        "default": true,
        order: 10
      },
      openPreviewInSplitPane: {
        type: 'boolean',
        "default": true,
        order: 20
      },
      previewSplitPaneDir: {
        title: 'Direction to load the preview in split pane',
        type: 'string',
        "default": 'right',
        "enum": ['down', 'right'],
        order: 25
      },
      grammars: {
        type: 'array',
        "default": ['source.gfm', 'source.litcoffee', 'text.html.basic', 'text.md', 'text.plain', 'text.plain.null-grammar'],
        order: 30
      },
      enableLatexRenderingByDefault: {
        title: 'Enable Math Rendering By Default',
        type: 'boolean',
        "default": false,
        order: 40
      },
      useLazyHeaders: {
        title: 'Use Lazy Headers',
        description: 'Require no space after headings #',
        type: 'boolean',
        "default": true,
        order: 45
      },
      useGitHubStyle: {
        title: 'Use GitHub.com style',
        type: 'boolean',
        "default": false,
        order: 50
      },
      enablePandoc: {
        type: 'boolean',
        "default": false,
        title: 'Enable Pandoc Parser',
        order: 100
      },
      useNativePandocCodeStyles: {
        type: 'boolean',
        "default": false,
        description: 'Don\'t convert fenced code blocks to Atom editors when using\nPandoc parser',
        order: 105
      },
      pandocPath: {
        type: 'string',
        "default": 'pandoc',
        title: 'Pandoc Options: Path',
        description: 'Please specify the correct path to your pandoc executable',
        dependencies: ['enablePandoc'],
        order: 110
      },
      pandocArguments: {
        type: 'array',
        "default": [],
        title: 'Pandoc Options: Commandline Arguments',
        description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
        dependencies: ['enablePandoc'],
        order: 120
      },
      pandocMarkdownFlavor: {
        type: 'string',
        "default": 'markdown-raw_tex+tex_math_single_backslash',
        title: 'Pandoc Options: Markdown Flavor',
        description: 'Enter the pandoc markdown flavor you want',
        dependencies: ['enablePandoc'],
        order: 130
      },
      pandocBibliography: {
        type: 'boolean',
        "default": false,
        title: 'Pandoc Options: Citations',
        description: 'Enable this for bibliography parsing',
        dependencies: ['enablePandoc'],
        order: 140
      },
      pandocRemoveReferences: {
        type: 'boolean',
        "default": true,
        title: 'Pandoc Options: Remove References',
        description: 'Removes references at the end of the HTML preview',
        dependencies: ['pandocBibliography'],
        order: 150
      },
      pandocBIBFile: {
        type: 'string',
        "default": 'bibliography.bib',
        title: 'Pandoc Options: Bibliography (bibfile)',
        description: 'Name of bibfile to search for recursivly',
        dependencies: ['pandocBibliography'],
        order: 160
      },
      pandocBIBFileFallback: {
        type: 'string',
        "default": '',
        title: 'Pandoc Options: Fallback Bibliography (bibfile)',
        description: 'Full path to fallback bibfile',
        dependencies: ['pandocBibliography'],
        order: 165
      },
      pandocCSLFile: {
        type: 'string',
        "default": 'custom.csl',
        title: 'Pandoc Options: Bibliography Style (cslfile)',
        description: 'Name of cslfile to search for recursivly',
        dependencies: ['pandocBibliography'],
        order: 170
      },
      pandocCSLFileFallback: {
        type: 'string',
        "default": '',
        title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
        description: 'Full path to fallback cslfile',
        dependencies: ['pandocBibliography'],
        order: 175
      }
    },
    activate: function() {
      var previewFile;
      if (parseFloat(atom.getVersion()) < 1.7) {
        atom.deserializers.add({
          name: 'MarkdownPreviewView',
          deserialize: module.exports.createMarkdownPreviewView.bind(module.exports)
        });
      }
      atom.commands.add('atom-workspace', {
        'markdown-preview-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'markdown-preview-plus:copy-html': (function(_this) {
          return function() {
            return _this.copyHtml();
          };
        })(this),
        'markdown-preview-plus:toggle-break-on-single-newline': function() {
          var keyPath;
          keyPath = 'markdown-preview-plus.breakOnSingleNewline';
          return atom.config.set(keyPath, !atom.config.get(keyPath));
        }
      });
      previewFile = this.previewFile.bind(this);
      atom.commands.add('.tree-view .file .name[data-name$=\\.markdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkd]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.ron]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.txt]', 'markdown-preview-plus:preview-file', previewFile);
      return atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var error, host, pathname, protocol, ref;
          try {
            ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
          } catch (error1) {
            error = error1;
            return;
          }
          if (protocol !== 'markdown-preview-plus:') {
            return;
          }
          try {
            if (pathname) {
              pathname = decodeURI(pathname);
            }
          } catch (error1) {
            error = error1;
            return;
          }
          if (host === 'editor') {
            return _this.createMarkdownPreviewView({
              editorId: pathname.substring(1)
            });
          } else {
            return _this.createMarkdownPreviewView({
              filePath: pathname
            });
          }
        };
      })(this));
    },
    createMarkdownPreviewView: function(state) {
      if (state.editorId || fs.isFileSync(state.filePath)) {
        if (MarkdownPreviewView == null) {
          MarkdownPreviewView = require('./markdown-preview-view');
        }
        return new MarkdownPreviewView(state);
      }
    },
    toggle: function() {
      var editor, grammars, ref, ref1;
      if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
        atom.workspace.destroyActivePaneItem();
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      grammars = (ref = atom.config.get('markdown-preview-plus.grammars')) != null ? ref : [];
      if (ref1 = editor.getGrammar().scopeName, indexOf.call(grammars, ref1) < 0) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    uriForEditor: function(editor) {
      return "markdown-preview-plus://editor/" + editor.id;
    },
    removePreviewForEditor: function(editor) {
      var preview, previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        preview = previewPane.itemForURI(uri);
        if (preview !== previewPane.getActiveItem()) {
          previewPane.activateItem(preview);
          return false;
        }
        previewPane.destroyItem(preview);
        return true;
      } else {
        return false;
      }
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true
      };
      if (atom.config.get('markdown-preview-plus.openPreviewInSplitPane')) {
        options.split = atom.config.get('markdown-preview-plus.previewSplitPaneDir');
      }
      return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
        if (isMarkdownPreviewView(markdownPreviewView)) {
          return previousActivePane.activate();
        }
      });
    },
    previewFile: function(arg) {
      var editor, filePath, i, len, ref, target;
      target = arg.target;
      filePath = target.dataset.path;
      if (!filePath) {
        return;
      }
      ref = atom.workspace.getTextEditors();
      for (i = 0, len = ref.length; i < len; i++) {
        editor = ref[i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("markdown-preview-plus://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    },
    copyHtml: function(callback, scaleMath) {
      var editor, renderLaTeX, text;
      if (callback == null) {
        callback = atom.clipboard.write.bind(atom.clipboard);
      }
      if (scaleMath == null) {
        scaleMath = 100;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      if (renderer == null) {
        renderer = require('./renderer');
      }
      text = editor.getSelectedText() || editor.getText();
      renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
      return renderer.toHTML(text, editor.getPath(), editor.getGrammar(), renderLaTeX, true, function(error, html) {
        if (error) {
          return console.warn('Copying Markdown as HTML failed', error);
        } else if (renderLaTeX) {
          if (mathjaxHelper == null) {
            mathjaxHelper = require('./mathjax-helper');
          }
          return mathjaxHelper.processHTMLString(html, function(proHTML) {
            proHTML = proHTML.replace(/MathJax\_SVG.*?font\-size\: 100%/g, function(match) {
              return match.replace(/font\-size\: 100%/, "font-size: " + scaleMath + "%");
            });
            return callback(proHTML);
          });
        } else {
          return callback(html);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xyYW1pcmV6Ly5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXByZXZpZXctcGx1cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRFQUFBO0lBQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxtQkFBQSxHQUFzQjs7RUFDdEIsUUFBQSxHQUFXOztFQUNYLGFBQUEsR0FBZ0I7O0VBRWhCLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDs7TUFDdEIsc0JBQXVCLE9BQUEsQ0FBUSx5QkFBUjs7V0FDdkIsTUFBQSxZQUFrQjtFQUZJOztFQUl4QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsb0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7T0FERjtNQUlBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLEVBRlA7T0FMRjtNQVFBLHNCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxFQUZQO09BVEY7TUFZQSxtQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLDZDQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLE9BQVQsQ0FITjtRQUlBLEtBQUEsRUFBTyxFQUpQO09BYkY7TUFrQkEsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQ1AsWUFETyxFQUVQLGtCQUZPLEVBR1AsaUJBSE8sRUFJUCxTQUpPLEVBS1AsWUFMTyxFQU1QLHlCQU5PLENBRFQ7UUFTQSxLQUFBLEVBQU8sRUFUUDtPQW5CRjtNQTZCQSw2QkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGtDQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7UUFHQSxLQUFBLEVBQU8sRUFIUDtPQTlCRjtNQWtDQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sa0JBQVA7UUFDQSxXQUFBLEVBQWEsbUNBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtRQUlBLEtBQUEsRUFBTyxFQUpQO09BbkNGO01Bd0NBLGNBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxzQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO1FBR0EsS0FBQSxFQUFPLEVBSFA7T0F6Q0Y7TUE2Q0EsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxLQUFBLEVBQU8sc0JBRlA7UUFHQSxLQUFBLEVBQU8sR0FIUDtPQTlDRjtNQWtEQSx5QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNkVBRmI7UUFLQSxLQUFBLEVBQU8sR0FMUDtPQW5ERjtNQXlEQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsUUFEVDtRQUVBLEtBQUEsRUFBTyxzQkFGUDtRQUdBLFdBQUEsRUFBYSwyREFIYjtRQUlBLFlBQUEsRUFBYyxDQUFDLGNBQUQsQ0FKZDtRQUtBLEtBQUEsRUFBTyxHQUxQO09BMURGO01BZ0VBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUFPLHVDQUZQO1FBR0EsV0FBQSxFQUFhLHFHQUhiO1FBSUEsWUFBQSxFQUFjLENBQUMsY0FBRCxDQUpkO1FBS0EsS0FBQSxFQUFPLEdBTFA7T0FqRUY7TUF1RUEsb0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyw0Q0FEVDtRQUVBLEtBQUEsRUFBTyxpQ0FGUDtRQUdBLFdBQUEsRUFBYSwyQ0FIYjtRQUlBLFlBQUEsRUFBYyxDQUFDLGNBQUQsQ0FKZDtRQUtBLEtBQUEsRUFBTyxHQUxQO09BeEVGO01BOEVBLGtCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLEtBQUEsRUFBTywyQkFGUDtRQUdBLFdBQUEsRUFBYSxzQ0FIYjtRQUlBLFlBQUEsRUFBYyxDQUFDLGNBQUQsQ0FKZDtRQUtBLEtBQUEsRUFBTyxHQUxQO09BL0VGO01BcUZBLHNCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxtQ0FGUDtRQUdBLFdBQUEsRUFBYSxtREFIYjtRQUlBLFlBQUEsRUFBYyxDQUFDLG9CQUFELENBSmQ7UUFLQSxLQUFBLEVBQU8sR0FMUDtPQXRGRjtNQTRGQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsa0JBRFQ7UUFFQSxLQUFBLEVBQU8sd0NBRlA7UUFHQSxXQUFBLEVBQWEsMENBSGI7UUFJQSxZQUFBLEVBQWMsQ0FBQyxvQkFBRCxDQUpkO1FBS0EsS0FBQSxFQUFPLEdBTFA7T0E3RkY7TUFtR0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUFPLGlEQUZQO1FBR0EsV0FBQSxFQUFhLCtCQUhiO1FBSUEsWUFBQSxFQUFjLENBQUMsb0JBQUQsQ0FKZDtRQUtBLEtBQUEsRUFBTyxHQUxQO09BcEdGO01BMEdBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxZQURUO1FBRUEsS0FBQSxFQUFPLDhDQUZQO1FBR0EsV0FBQSxFQUFhLDBDQUhiO1FBSUEsWUFBQSxFQUFjLENBQUMsb0JBQUQsQ0FKZDtRQUtBLEtBQUEsRUFBTyxHQUxQO09BM0dGO01BaUhBLHFCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLEtBQUEsRUFBTyx1REFGUDtRQUdBLFdBQUEsRUFBYSwrQkFIYjtRQUlBLFlBQUEsRUFBYyxDQUFDLG9CQUFELENBSmQ7UUFLQSxLQUFBLEVBQU8sR0FMUDtPQWxIRjtLQURGO0lBMkhBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUcsVUFBQSxDQUFXLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBWCxDQUFBLEdBQWdDLEdBQW5DO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUNFO1VBQUEsSUFBQSxFQUFNLHFCQUFOO1VBQ0EsV0FBQSxFQUFhLE1BQU0sQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsSUFBekMsQ0FBOEMsTUFBTSxDQUFDLE9BQXJELENBRGI7U0FERixFQURGOztNQUtBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDRTtRQUFBLDhCQUFBLEVBQWdDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQzlCLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFEOEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO1FBRUEsaUNBQUEsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDakMsS0FBQyxDQUFBLFFBQUQsQ0FBQTtVQURpQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGbkM7UUFJQSxzREFBQSxFQUF3RCxTQUFBO0FBQ3RELGNBQUE7VUFBQSxPQUFBLEdBQVU7aUJBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLENBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLE9BQWhCLENBQTdCO1FBRnNELENBSnhEO09BREY7TUFTQSxXQUFBLEdBQWMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCO01BQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdEQUFsQixFQUFvRSxvQ0FBcEUsRUFBMEcsV0FBMUc7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsMENBQWxCLEVBQThELG9DQUE5RCxFQUFvRyxXQUFwRztNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw2Q0FBbEIsRUFBaUUsb0NBQWpFLEVBQXVHLFdBQXZHO01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDJDQUFsQixFQUErRCxvQ0FBL0QsRUFBcUcsV0FBckc7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsOENBQWxCLEVBQWtFLG9DQUFsRSxFQUF3RyxXQUF4RztNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiwyQ0FBbEIsRUFBK0Qsb0NBQS9ELEVBQXFHLFdBQXJHO01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDJDQUFsQixFQUErRCxvQ0FBL0QsRUFBcUcsV0FBckc7YUFFQSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7QUFDdkIsY0FBQTtBQUFBO1lBQ0UsTUFBNkIsR0FBRyxDQUFDLEtBQUosQ0FBVSxTQUFWLENBQTdCLEVBQUMsdUJBQUQsRUFBVyxlQUFYLEVBQWlCLHdCQURuQjtXQUFBLGNBQUE7WUFFTTtBQUNKLG1CQUhGOztVQUtBLElBQWMsUUFBQSxLQUFZLHdCQUExQjtBQUFBLG1CQUFBOztBQUVBO1lBQ0UsSUFBa0MsUUFBbEM7Y0FBQSxRQUFBLEdBQVcsU0FBQSxDQUFVLFFBQVYsRUFBWDthQURGO1dBQUEsY0FBQTtZQUVNO0FBQ0osbUJBSEY7O1VBS0EsSUFBRyxJQUFBLEtBQVEsUUFBWDttQkFDRSxLQUFDLENBQUEseUJBQUQsQ0FBMkI7Y0FBQSxRQUFBLEVBQVUsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsQ0FBbkIsQ0FBVjthQUEzQixFQURGO1dBQUEsTUFBQTttQkFHRSxLQUFDLENBQUEseUJBQUQsQ0FBMkI7Y0FBQSxRQUFBLEVBQVUsUUFBVjthQUEzQixFQUhGOztRQWJ1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUF4QlEsQ0EzSFY7SUFxS0EseUJBQUEsRUFBMkIsU0FBQyxLQUFEO01BQ3pCLElBQUcsS0FBSyxDQUFDLFFBQU4sSUFBa0IsRUFBRSxDQUFDLFVBQUgsQ0FBYyxLQUFLLENBQUMsUUFBcEIsQ0FBckI7O1VBQ0Usc0JBQXVCLE9BQUEsQ0FBUSx5QkFBUjs7ZUFDbkIsSUFBQSxtQkFBQSxDQUFvQixLQUFwQixFQUZOOztJQUR5QixDQXJLM0I7SUEwS0EsTUFBQSxFQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxxQkFBQSxDQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBdEIsQ0FBSDtRQUNFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQWYsQ0FBQTtBQUNBLGVBRkY7O01BSUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQWMsY0FBZDtBQUFBLGVBQUE7O01BRUEsUUFBQSw2RUFBK0Q7TUFDL0QsV0FBYyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBcEIsRUFBQSxhQUFpQyxRQUFqQyxFQUFBLElBQUEsS0FBZDtBQUFBLGVBQUE7O01BRUEsSUFBQSxDQUFvQyxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsTUFBeEIsQ0FBcEM7ZUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckIsRUFBQTs7SUFYTSxDQTFLUjtJQXVMQSxZQUFBLEVBQWMsU0FBQyxNQUFEO2FBQ1osaUNBQUEsR0FBa0MsTUFBTSxDQUFDO0lBRDdCLENBdkxkO0lBMExBLHNCQUFBLEVBQXdCLFNBQUMsTUFBRDtBQUN0QixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZDtNQUNOLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsR0FBMUI7TUFDZCxJQUFHLG1CQUFIO1FBQ0UsT0FBQSxHQUFVLFdBQVcsQ0FBQyxVQUFaLENBQXVCLEdBQXZCO1FBQ1YsSUFBRyxPQUFBLEtBQWEsV0FBVyxDQUFDLGFBQVosQ0FBQSxDQUFoQjtVQUNFLFdBQVcsQ0FBQyxZQUFaLENBQXlCLE9BQXpCO0FBQ0EsaUJBQU8sTUFGVDs7UUFHQSxXQUFXLENBQUMsV0FBWixDQUF3QixPQUF4QjtlQUNBLEtBTkY7T0FBQSxNQUFBO2VBUUUsTUFSRjs7SUFIc0IsQ0ExTHhCO0lBdU1BLG1CQUFBLEVBQXFCLFNBQUMsTUFBRDtBQUNuQixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZDtNQUNOLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO01BQ3JCLE9BQUEsR0FDRTtRQUFBLGNBQUEsRUFBZ0IsSUFBaEI7O01BQ0YsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOENBQWhCLENBQUg7UUFDRSxPQUFPLENBQUMsS0FBUixHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkNBQWhCLEVBRGxCOzthQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixHQUFwQixFQUF5QixPQUF6QixDQUFpQyxDQUFDLElBQWxDLENBQXVDLFNBQUMsbUJBQUQ7UUFDckMsSUFBRyxxQkFBQSxDQUFzQixtQkFBdEIsQ0FBSDtpQkFDRSxrQkFBa0IsQ0FBQyxRQUFuQixDQUFBLEVBREY7O01BRHFDLENBQXZDO0lBUG1CLENBdk1yQjtJQWtOQSxXQUFBLEVBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLFNBQUQ7TUFDWixRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQztNQUMxQixJQUFBLENBQWMsUUFBZDtBQUFBLGVBQUE7O0FBRUE7QUFBQSxXQUFBLHFDQUFBOztjQUFtRCxNQUFNLENBQUMsT0FBUCxDQUFBLENBQUEsS0FBb0I7OztRQUNyRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckI7QUFDQTtBQUZGO2FBSUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLDBCQUFBLEdBQTBCLENBQUMsU0FBQSxDQUFVLFFBQVYsQ0FBRCxDQUE5QyxFQUFzRTtRQUFBLGNBQUEsRUFBZ0IsSUFBaEI7T0FBdEU7SUFSVyxDQWxOYjtJQTROQSxRQUFBLEVBQVUsU0FBQyxRQUFELEVBQXVELFNBQXZEO0FBQ1IsVUFBQTs7UUFEUyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQXJCLENBQTBCLElBQUksQ0FBQyxTQUEvQjs7O1FBQTJDLFlBQVk7O01BQzNFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxJQUFjLGNBQWQ7QUFBQSxlQUFBOzs7UUFFQSxXQUFZLE9BQUEsQ0FBUSxZQUFSOztNQUNaLElBQUEsR0FBTyxNQUFNLENBQUMsZUFBUCxDQUFBLENBQUEsSUFBNEIsTUFBTSxDQUFDLE9BQVAsQ0FBQTtNQUNuQyxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFEQUFoQjthQUNkLFFBQVEsQ0FBQyxNQUFULENBQWdCLElBQWhCLEVBQXNCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBdEIsRUFBd0MsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUF4QyxFQUE2RCxXQUE3RCxFQUEwRSxJQUExRSxFQUFnRixTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQzlFLElBQUcsS0FBSDtpQkFDRSxPQUFPLENBQUMsSUFBUixDQUFhLGlDQUFiLEVBQWdELEtBQWhELEVBREY7U0FBQSxNQUVLLElBQUcsV0FBSDs7WUFDSCxnQkFBaUIsT0FBQSxDQUFRLGtCQUFSOztpQkFDakIsYUFBYSxDQUFDLGlCQUFkLENBQWdDLElBQWhDLEVBQXNDLFNBQUMsT0FBRDtZQUNwQyxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsbUNBQWhCLEVBQXFELFNBQUMsS0FBRDtxQkFDN0QsS0FBSyxDQUFDLE9BQU4sQ0FBYyxtQkFBZCxFQUFtQyxhQUFBLEdBQWMsU0FBZCxHQUF3QixHQUEzRDtZQUQ2RCxDQUFyRDttQkFFVixRQUFBLENBQVMsT0FBVDtVQUhvQyxDQUF0QyxFQUZHO1NBQUEsTUFBQTtpQkFPSCxRQUFBLENBQVMsSUFBVCxFQVBHOztNQUh5RSxDQUFoRjtJQVBRLENBNU5WOztBQVpGIiwic291cmNlc0NvbnRlbnQiOlsidXJsID0gcmVxdWlyZSAndXJsJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5NYXJrZG93blByZXZpZXdWaWV3ID0gbnVsbFxucmVuZGVyZXIgPSBudWxsXG5tYXRoamF4SGVscGVyID0gbnVsbFxuXG5pc01hcmtkb3duUHJldmlld1ZpZXcgPSAob2JqZWN0KSAtPlxuICBNYXJrZG93blByZXZpZXdWaWV3ID89IHJlcXVpcmUgJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuICBvYmplY3QgaW5zdGFuY2VvZiBNYXJrZG93blByZXZpZXdWaWV3XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDBcbiAgICBsaXZlVXBkYXRlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMTBcbiAgICBvcGVuUHJldmlld0luU3BsaXRQYW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMjBcbiAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOlxuICAgICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdyaWdodCdcbiAgICAgIGVudW06IFsnZG93bicsICdyaWdodCddXG4gICAgICBvcmRlcjogMjVcbiAgICBncmFtbWFyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgJ3NvdXJjZS5nZm0nXG4gICAgICAgICdzb3VyY2UubGl0Y29mZmVlJ1xuICAgICAgICAndGV4dC5odG1sLmJhc2ljJ1xuICAgICAgICAndGV4dC5tZCdcbiAgICAgICAgJ3RleHQucGxhaW4nXG4gICAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcidcbiAgICAgIF1cbiAgICAgIG9yZGVyOiAzMFxuICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OlxuICAgICAgdGl0bGU6ICdFbmFibGUgTWF0aCBSZW5kZXJpbmcgQnkgRGVmYXVsdCdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA0MFxuICAgIHVzZUxhenlIZWFkZXJzOlxuICAgICAgdGl0bGU6ICdVc2UgTGF6eSBIZWFkZXJzJ1xuICAgICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA0NVxuICAgIHVzZUdpdEh1YlN0eWxlOlxuICAgICAgdGl0bGU6ICdVc2UgR2l0SHViLmNvbSBzdHlsZSdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA1MFxuICAgIGVuYWJsZVBhbmRvYzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnRW5hYmxlIFBhbmRvYyBQYXJzZXInXG4gICAgICBvcmRlcjogMTAwXG4gICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydcbiAgICAgICAgRG9uJ3QgY29udmVydCBmZW5jZWQgY29kZSBibG9ja3MgdG8gQXRvbSBlZGl0b3JzIHdoZW4gdXNpbmdcbiAgICAgICAgUGFuZG9jIHBhcnNlcicnJ1xuICAgICAgb3JkZXI6IDEwNVxuICAgIHBhbmRvY1BhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ3BhbmRvYydcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFBhdGgnXG4gICAgICBkZXNjcmlwdGlvbjogJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZSdcbiAgICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXVxuICAgICAgb3JkZXI6IDExMFxuICAgIHBhbmRvY0FyZ3VtZW50czpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtdXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBDb21tYW5kbGluZSBBcmd1bWVudHMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLidcbiAgICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXVxuICAgICAgb3JkZXI6IDEyMFxuICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBNYXJrZG93biBGbGF2b3InXG4gICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50J1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddXG4gICAgICBvcmRlcjogMTMwXG4gICAgcGFuZG9jQmlibGlvZ3JhcGh5OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQ2l0YXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ11cbiAgICAgIG9yZGVyOiAxNDBcbiAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBSZW1vdmUgUmVmZXJlbmNlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldydcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE1MFxuICAgIHBhbmRvY0JJQkZpbGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmx5J1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddXG4gICAgICBvcmRlcjogMTYwXG4gICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZSdcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE2NVxuICAgIHBhbmRvY0NTTEZpbGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2N1c3RvbS5jc2wnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGNzbGZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmx5J1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddXG4gICAgICBvcmRlcjogMTcwXG4gICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZSdcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE3NVxuXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgaWYgcGFyc2VGbG9hdChhdG9tLmdldFZlcnNpb24oKSkgPCAxLjdcbiAgICAgIGF0b20uZGVzZXJpYWxpemVycy5hZGRcbiAgICAgICAgbmFtZTogJ01hcmtkb3duUHJldmlld1ZpZXcnXG4gICAgICAgIGRlc2VyaWFsaXplOiBtb2R1bGUuZXhwb3J0cy5jcmVhdGVNYXJrZG93blByZXZpZXdWaWV3LmJpbmQobW9kdWxlLmV4cG9ydHMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiA9PlxuICAgICAgICBAdG9nZ2xlKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJzogPT5cbiAgICAgICAgQGNvcHlIdG1sKClcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLWJyZWFrLW9uLXNpbmdsZS1uZXdsaW5lJzogLT5cbiAgICAgICAga2V5UGF0aCA9ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnXG4gICAgICAgIGF0b20uY29uZmlnLnNldChrZXlQYXRoLCBub3QgYXRvbS5jb25maWcuZ2V0KGtleVBhdGgpKVxuXG4gICAgcHJldmlld0ZpbGUgPSBAcHJldmlld0ZpbGUuYmluZCh0aGlzKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5tYXJrZG93bl0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1kXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWRvd25dJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5ta2RdJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5ta2Rvd25dJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5yb25dJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC50eHRdJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyICh1cmlUb09wZW4pID0+XG4gICAgICB0cnlcbiAgICAgICAge3Byb3RvY29sLCBob3N0LCBwYXRobmFtZX0gPSB1cmwucGFyc2UodXJpVG9PcGVuKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJldHVybiB1bmxlc3MgcHJvdG9jb2wgaXMgJ21hcmtkb3duLXByZXZpZXctcGx1czonXG5cbiAgICAgIHRyeVxuICAgICAgICBwYXRobmFtZSA9IGRlY29kZVVSSShwYXRobmFtZSkgaWYgcGF0aG5hbWVcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBob3N0IGlzICdlZGl0b3InXG4gICAgICAgIEBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KGVkaXRvcklkOiBwYXRobmFtZS5zdWJzdHJpbmcoMSkpXG4gICAgICBlbHNlXG4gICAgICAgIEBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KGZpbGVQYXRoOiBwYXRobmFtZSlcblxuICBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3OiAoc3RhdGUpIC0+XG4gICAgaWYgc3RhdGUuZWRpdG9ySWQgb3IgZnMuaXNGaWxlU3luYyhzdGF0ZS5maWxlUGF0aClcbiAgICAgIE1hcmtkb3duUHJldmlld1ZpZXcgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4gICAgICBuZXcgTWFya2Rvd25QcmV2aWV3VmlldyhzdGF0ZSlcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgaXNNYXJrZG93blByZXZpZXdWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpXG4gICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgcmV0dXJuXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIGdyYW1tYXJzID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnKSA/IFtdXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSBpbiBncmFtbWFyc1xuXG4gICAgQGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKSB1bmxlc3MgQHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuXG4gIHVyaUZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8je2VkaXRvci5pZH1cIlxuXG4gIHJlbW92ZVByZXZpZXdGb3JFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgdXJpID0gQHVyaUZvckVkaXRvcihlZGl0b3IpXG4gICAgcHJldmlld1BhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKHVyaSlcbiAgICBpZiBwcmV2aWV3UGFuZT9cbiAgICAgIHByZXZpZXcgPSBwcmV2aWV3UGFuZS5pdGVtRm9yVVJJKHVyaSlcbiAgICAgIGlmIHByZXZpZXcgaXNudCBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKClcbiAgICAgICAgcHJldmlld1BhbmUuYWN0aXZhdGVJdGVtKHByZXZpZXcpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcHJldmlld1BhbmUuZGVzdHJveUl0ZW0ocHJldmlldylcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGFkZFByZXZpZXdGb3JFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgdXJpID0gQHVyaUZvckVkaXRvcihlZGl0b3IpXG4gICAgcHJldmlvdXNBY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgb3B0aW9ucyA9XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLm9wZW5QcmV2aWV3SW5TcGxpdFBhbmUnKVxuICAgICAgb3B0aW9ucy5zcGxpdCA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdTcGxpdFBhbmVEaXInKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKS50aGVuIChtYXJrZG93blByZXZpZXdWaWV3KSAtPlxuICAgICAgaWYgaXNNYXJrZG93blByZXZpZXdWaWV3KG1hcmtkb3duUHJldmlld1ZpZXcpXG4gICAgICAgIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG5cbiAgcHJldmlld0ZpbGU6ICh7dGFyZ2V0fSkgLT5cbiAgICBmaWxlUGF0aCA9IHRhcmdldC5kYXRhc2V0LnBhdGhcbiAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoXG5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkgd2hlbiBlZGl0b3IuZ2V0UGF0aCgpIGlzIGZpbGVQYXRoXG4gICAgICBAYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICByZXR1cm5cblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4gXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8je2VuY29kZVVSSShmaWxlUGF0aCl9XCIsIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG5cbiAgY29weUh0bWw6IChjYWxsYmFjayA9IGF0b20uY2xpcGJvYXJkLndyaXRlLmJpbmQoYXRvbS5jbGlwYm9hcmQpLCBzY2FsZU1hdGggPSAxMDApIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3I/XG5cbiAgICByZW5kZXJlciA/PSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuICAgIHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgb3IgZWRpdG9yLmdldFRleHQoKVxuICAgIHJlbmRlckxhVGVYID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnXG4gICAgcmVuZGVyZXIudG9IVE1MIHRleHQsIGVkaXRvci5nZXRQYXRoKCksIGVkaXRvci5nZXRHcmFtbWFyKCksIHJlbmRlckxhVGVYLCB0cnVlLCAoZXJyb3IsIGh0bWwpIC0+XG4gICAgICBpZiBlcnJvclxuICAgICAgICBjb25zb2xlLndhcm4oJ0NvcHlpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgIGVsc2UgaWYgcmVuZGVyTGFUZVhcbiAgICAgICAgbWF0aGpheEhlbHBlciA/PSByZXF1aXJlICcuL21hdGhqYXgtaGVscGVyJ1xuICAgICAgICBtYXRoamF4SGVscGVyLnByb2Nlc3NIVE1MU3RyaW5nIGh0bWwsIChwcm9IVE1MKSAtPlxuICAgICAgICAgIHByb0hUTUwgPSBwcm9IVE1MLnJlcGxhY2UgL01hdGhKYXhcXF9TVkcuKj9mb250XFwtc2l6ZVxcOiAxMDAlL2csIChtYXRjaCkgLT5cbiAgICAgICAgICAgIG1hdGNoLnJlcGxhY2UgL2ZvbnRcXC1zaXplXFw6IDEwMCUvLCBcImZvbnQtc2l6ZTogI3tzY2FsZU1hdGh9JVwiXG4gICAgICAgICAgY2FsbGJhY2socHJvSFRNTClcbiAgICAgIGVsc2VcbiAgICAgICAgY2FsbGJhY2soaHRtbClcbiJdfQ==
