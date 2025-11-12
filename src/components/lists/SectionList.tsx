import React, { ReactNode } from 'react';
import { colors } from '../../theme';

export interface Section<T> {
  title: string;
  data: T[];
  key?: string;
  renderSectionHeader?: (section: Section<T>) => ReactNode;
  renderSectionFooter?: (section: Section<T>) => ReactNode;
}

export interface SectionListProps<T> {
  sections: Section<T>[];
  renderItem: (item: T, section: Section<T>, index: number) => ReactNode;
  renderSectionHeader?: (section: Section<T>) => ReactNode;
  renderSectionFooter?: (section: Section<T>) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  stickySectionHeadersEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  sectionHeaderStyle?: React.CSSProperties;
  sectionFooterStyle?: React.CSSProperties;
}

/**
 * SectionList component for rendering categorized lists
 */
export default function SectionList<T>({
  sections,
  renderItem,
  renderSectionHeader,
  renderSectionFooter,
  keyExtractor,
  stickySectionHeadersEnabled = false,
  className = '',
  style,
  itemStyle,
  sectionHeaderStyle,
  sectionFooterStyle,
}: SectionListProps<T>) {
  const defaultRenderSectionHeader = (section: Section<T>) => {
    if (section.renderSectionHeader) {
      return section.renderSectionHeader(section);
    }

    return (
      <div
        style={{
          padding: 'var(--spacing-md)',
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          fontWeight: 600,
          fontSize: '0.875rem',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          position: stickySectionHeadersEnabled ? 'sticky' : 'static',
          top: 0,
          zIndex: 10,
          ...sectionHeaderStyle,
        }}
      >
        {section.title}
      </div>
    );
  };

  const defaultRenderSectionFooter = (section: Section<T>) => {
    if (section.renderSectionFooter) {
      return section.renderSectionFooter(section);
    }

    if (section.data.length === 0) {
      return (
        <div
          style={{
            padding: 'var(--spacing-md)',
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            ...sectionFooterStyle,
          }}
        >
          No items in this section
        </div>
      );
    }

    return null;
  };

  return (
    <div className={className} style={style}>
      {sections.map((section, sectionIndex) => (
        <div key={section.key || section.title || sectionIndex}>
          {/* Section Header */}
          {section.title && defaultRenderSectionHeader(section)}

          {/* Section Items */}
          <div>
            {section.data.map((item, itemIndex) => (
              <div
                key={keyExtractor ? keyExtractor(item, itemIndex) : itemIndex}
                style={itemStyle}
              >
                {renderItem(item, section, itemIndex)}
              </div>
            ))}
          </div>

          {/* Section Footer */}
          {defaultRenderSectionFooter(section)}
        </div>
      ))}
    </div>
  );
}

