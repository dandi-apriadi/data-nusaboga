import React from 'react';

/**
 * ResponsiveTable
 * - Wraps wide tables with a horizontal scroller
 * - If a `<table>` element is provided as a child, the component will
 *   clone it and ensure it has `min-w-full table-auto` classes so columns
 *   don't collapse and horizontal scrolling is possible on small screens.
 *
 * Usage:
 * <ResponsiveTable>
 *   <table>...</table>
 * </ResponsiveTable>
 */
const ResponsiveTable = ({ children, className = '', wrapperClassName = 'overflow-x-auto -mx-4 sm:mx-0', ...props }) => {
  const enhanceChild = (child) => {
    if (!React.isValidElement(child)) return child;
    // Handle string type names as well as React components
    const typeName = typeof child.type === 'string' ? child.type : (child.type?.displayName || child.type?.name);
    if (!typeName) return child;
    if (typeName.toLowerCase() === 'table') {
      const existing = child.props.className || '';
      // If the table already defines a min-w-* class (e.g. min-w-full or min-w-max), don't force min-w-full
      const hasMinW = /\bmin-w-(?:full|max|\[.*?\])\b/.test(existing);
      const merged = `${existing} ${className} ${hasMinW ? '' : 'min-w-full'} table-auto`.trim();
      return React.cloneElement(child, { ...child.props, className: merged });
    }
    return child;
  };

  const enhancedChildren = React.Children.map(children, enhanceChild);

  return (
    <div className={wrapperClassName} {...props}>
      {enhancedChildren}
    </div>
  );
};

export default ResponsiveTable;
