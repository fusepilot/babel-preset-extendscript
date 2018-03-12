module.exports = function({ template, types: t }) {
  const wrapProgram = template(`
  try {
    BODY
  } catch(ERROR_VARIABLE_NAME) {
	  if (!ERROR_VARIABLE_NAME.stack) ERROR_VARIABLE_NAME.stack = "";
	  ERROR_VARIABLE_NAME.stack += "at root";
    '{"error": "' + ERROR_VARIABLE_NAME.name + '", "message": "' + ERROR_VARIABLE_NAME.message.replace(/"/g, \"'\") + '", "stack": "' + ERROR_VARIABLE_NAME.stack.replace(/"/g, \"'\") + '"}'
  }
`);

  const wrapFunction = template(`{
  try {
    BODY
  } catch(ERROR_VARIABLE_NAME) {
    if (!ERROR_VARIABLE_NAME.stack) ERROR_VARIABLE_NAME.stack = "";
    ERROR_VARIABLE_NAME.stack += "at " + FUNCTION_NAME + "\\\\n";
    throw ERROR_VARIABLE_NAME
  }
}`);

  const markErrorResolved = template(`
  ERROR._r = true
`);

  const markErrorUnresolved = template(`
  delete ERROR._r
`);

  const shouldSkip = (() => {
    const records = new Map();

    return (path, state) => {
      if (state.end) {
        return true;
      }

      // ignore generated code
      if (!path.node.loc) {
        return true;
      }

      // ignore processed nodes
      const nodeType = path.node.type;
      if (!records.has(nodeType)) {
        records.set(nodeType, new Set());
      }
      const recordsOfThisType = records.get(nodeType);
      const sourceLocation = `${filename}:${path.node.start}-${path.node.end}`;
      const hasRecord = recordsOfThisType.has(sourceLocation);
      recordsOfThisType.add(sourceLocation);
      return hasRecord;
    };
  })();

  // filename of which is being processed
  let filename;

  // function name reporting error, default: 'reportError'
  let reportError;

  return {
    pre(file) {
      ({ reportError = 'reportError' } = this.opts);
    },
    visitor: {
      Program: {
        exit(path, state) {
          if (state.end) {
            return;
          }
          state.end = true;

          const body = path.node.body;
          if (body.length === 0) {
            return;
          }

          const loc = path.node.loc;
          const errorVariableName = path.scope.generateUidIdentifier('e');

          const programBody = wrapProgram({
            BODY: body,
            FUNCTION_NAME: t.StringLiteral('top-level code'),
            LINE: t.NumericLiteral(loc.start.line),
            COLUMN: t.NumericLiteral(loc.start.column),
            REPORT_ERROR: t.identifier(reportError),
            ERROR_VARIABLE_NAME: errorVariableName,
          });
          path.replaceWith(t.Program([programBody]));
        },
      },
      Function: {
        exit(path, state) {
          if (shouldSkip(path, state)) {
            return;
          }

          // ignore empty function body
          const body = path.node.body.body;
          if (body.length === 0) {
            return;
          }

          let functionName = 'anonymous function';
          if (path.node.type === 'FunctionDeclaration') {
            functionName = path.node.id.name;
          } else {
            let newFunction = path && path.node;
            if (newFunction && newFunction.id) {
              functionName = newFunction.id.name;
            }
          }

          const loc = path.node.loc;
          const errorVariableName = path.scope.generateUidIdentifier('e');

          path.get('body').replaceWith(
            wrapFunction({
              BODY: body,
              FUNCTION_NAME: t.StringLiteral(functionName),
              LINE: t.NumericLiteral(loc.start.line),
              COLUMN: t.NumericLiteral(loc.start.column),
              REPORT_ERROR: t.identifier(reportError),
              ERROR_VARIABLE_NAME: errorVariableName,
            })
          );
        },
      },
      CatchClause: {
        enter(path, state) {
          if (shouldSkip(path, state)) {
            return;
          }

          // variable name of error caught
          const errorVariableName = path.node.param.name;

          path.node.body.body.unshift(
            markErrorResolved({
              ERROR: t.Identifier(errorVariableName),
            })
          );
        },
      },
      ThrowStatement: {
        enter(path, state) {
          if (shouldSkip(path, state)) {
            return;
          }

          const error = path.node.argument;
          if (error.type === 'Identifier') {
            path.insertBefore(
              markErrorUnresolved({
                ERROR: t.Identifier(error.name),
              })
            );
          }
        },
      },
    },
  };
};
