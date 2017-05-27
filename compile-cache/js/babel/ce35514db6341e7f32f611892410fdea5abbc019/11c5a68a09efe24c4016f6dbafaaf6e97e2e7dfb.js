'use babel';

/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module atom:linter-markdown
 * @fileoverview Linter.
 */

/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */

var CompositeDisposable = require('atom').CompositeDisposable;
var path = require('path');
var config = require('./config');

var engine = undefined;
var processor = undefined;
var subscriptions = undefined;
var scopes = undefined;
var detectIgnore = undefined;

function lint(editor) {
  return engine({
    processor: processor,
    detectIgnore: detectIgnore,
    rcName: '.remarkrc',
    rcPath: path.resolve(__dirname, 'config.js'),
    packageField: 'remarkConfig',
    ignoreName: '.remarkignore',
    presetPrefix: 'remark-preset',
    pluginPrefix: 'remark'
  })(editor);
}

/**
 * Linter-markdown.
 *
 * @return {LinterConfiguration}
 */
function provideLinter() {
  if (!engine) {
    engine = require('unified-engine-atom');
  }

  if (!processor) {
    processor = require('remark');
  }

  return {
    grammarScopes: scopes,
    name: 'remark-lint',
    scope: 'file',
    lintOnFly: true,
    lint: lint
  };
}

function activate() {
  require('atom-package-deps').install('linter-markdown');

  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.config.observe('linter-markdown.scopes', function (value) {
    scopes = value;
  }));
  subscriptions.add(atom.config.observe('linter-markdown.detectIgnore', function (value) {
    detectIgnore = value;
  }));

  config.on();
}

function deactivate() {
  subscriptions.dispose();

  config.off();
}

/*
 * Expose.
 */
module.exports = {
  activate: activate,
  deactivate: deactivate,
  provideLinter: provideLinter
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9scmFtaXJlei8uYXRvbS9wYWNrYWdlcy9saW50ZXItbWFya2Rvd24vbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWVosSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLENBQUM7QUFDaEUsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbkMsSUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLElBQUksU0FBUyxZQUFBLENBQUM7QUFDZCxJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxJQUFJLFlBQVksWUFBQSxDQUFDOztBQUVqQixTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDcEIsU0FBTyxNQUFNLENBQUM7QUFDWixhQUFTLEVBQVQsU0FBUztBQUNULGdCQUFZLEVBQVosWUFBWTtBQUNaLFVBQU0sRUFBRSxXQUFXO0FBQ25CLFVBQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7QUFDNUMsZ0JBQVksRUFBRSxjQUFjO0FBQzVCLGNBQVUsRUFBRSxlQUFlO0FBQzNCLGdCQUFZLEVBQUUsZUFBZTtBQUM3QixnQkFBWSxFQUFFLFFBQVE7R0FDdkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ1o7Ozs7Ozs7QUFPRCxTQUFTLGFBQWEsR0FBRztBQUN2QixNQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsVUFBTSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0dBQ3pDOztBQUVELE1BQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxhQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQy9COztBQUVELFNBQU87QUFDTCxpQkFBYSxFQUFFLE1BQU07QUFDckIsUUFBSSxFQUFFLGFBQWE7QUFDbkIsU0FBSyxFQUFFLE1BQU07QUFDYixhQUFTLEVBQUUsSUFBSTtBQUNmLFFBQUksRUFBSixJQUFJO0dBQ0wsQ0FBQztDQUNIOztBQUVELFNBQVMsUUFBUSxHQUFHO0FBQ2xCLFNBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztBQUV4RCxlQUFhLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUUxQyxlQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3pFLFVBQU0sR0FBRyxLQUFLLENBQUM7R0FDaEIsQ0FBQyxDQUFDLENBQUM7QUFDSixlQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQy9FLGdCQUFZLEdBQUcsS0FBSyxDQUFDO0dBQ3RCLENBQUMsQ0FBQyxDQUFDOztBQUVKLFFBQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUNiOztBQUVELFNBQVMsVUFBVSxHQUFHO0FBQ3BCLGVBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFeEIsUUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2Q7Ozs7O0FBS0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFVBQVEsRUFBUixRQUFRO0FBQ1IsWUFBVSxFQUFWLFVBQVU7QUFDVixlQUFhLEVBQWIsYUFBYTtDQUNkLENBQUMiLCJmaWxlIjoiL1VzZXJzL2xyYW1pcmV6Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1tYXJrZG93bi9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyoqXG4gKiBAYXV0aG9yIFRpdHVzIFdvcm1lclxuICogQGNvcHlyaWdodCAyMDE1IFRpdHVzIFdvcm1lclxuICogQGxpY2Vuc2UgTUlUXG4gKiBAbW9kdWxlIGF0b206bGludGVyLW1hcmtkb3duXG4gKiBAZmlsZW92ZXJ2aWV3IExpbnRlci5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9uby11bnJlc29sdmVkICovXG5cbmNvbnN0IENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG5sZXQgZW5naW5lO1xubGV0IHByb2Nlc3NvcjtcbmxldCBzdWJzY3JpcHRpb25zO1xubGV0IHNjb3BlcztcbmxldCBkZXRlY3RJZ25vcmU7XG5cbmZ1bmN0aW9uIGxpbnQoZWRpdG9yKSB7XG4gIHJldHVybiBlbmdpbmUoe1xuICAgIHByb2Nlc3NvcixcbiAgICBkZXRlY3RJZ25vcmUsXG4gICAgcmNOYW1lOiAnLnJlbWFya3JjJyxcbiAgICByY1BhdGg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdjb25maWcuanMnKSxcbiAgICBwYWNrYWdlRmllbGQ6ICdyZW1hcmtDb25maWcnLFxuICAgIGlnbm9yZU5hbWU6ICcucmVtYXJraWdub3JlJyxcbiAgICBwcmVzZXRQcmVmaXg6ICdyZW1hcmstcHJlc2V0JyxcbiAgICBwbHVnaW5QcmVmaXg6ICdyZW1hcmsnXG4gIH0pKGVkaXRvcik7XG59XG5cbi8qKlxuICogTGludGVyLW1hcmtkb3duLlxuICpcbiAqIEByZXR1cm4ge0xpbnRlckNvbmZpZ3VyYXRpb259XG4gKi9cbmZ1bmN0aW9uIHByb3ZpZGVMaW50ZXIoKSB7XG4gIGlmICghZW5naW5lKSB7XG4gICAgZW5naW5lID0gcmVxdWlyZSgndW5pZmllZC1lbmdpbmUtYXRvbScpO1xuICB9XG5cbiAgaWYgKCFwcm9jZXNzb3IpIHtcbiAgICBwcm9jZXNzb3IgPSByZXF1aXJlKCdyZW1hcmsnKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ3JhbW1hclNjb3Blczogc2NvcGVzLFxuICAgIG5hbWU6ICdyZW1hcmstbGludCcsXG4gICAgc2NvcGU6ICdmaWxlJyxcbiAgICBsaW50T25GbHk6IHRydWUsXG4gICAgbGludFxuICB9O1xufVxuXG5mdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItbWFya2Rvd24nKTtcblxuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItbWFya2Rvd24uc2NvcGVzJywgKHZhbHVlKSA9PiB7XG4gICAgc2NvcGVzID0gdmFsdWU7XG4gIH0pKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLW1hcmtkb3duLmRldGVjdElnbm9yZScsICh2YWx1ZSkgPT4ge1xuICAgIGRldGVjdElnbm9yZSA9IHZhbHVlO1xuICB9KSk7XG5cbiAgY29uZmlnLm9uKCk7XG59XG5cbmZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuXG4gIGNvbmZpZy5vZmYoKTtcbn1cblxuLypcbiAqIEV4cG9zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlLFxuICBkZWFjdGl2YXRlLFxuICBwcm92aWRlTGludGVyXG59O1xuIl19