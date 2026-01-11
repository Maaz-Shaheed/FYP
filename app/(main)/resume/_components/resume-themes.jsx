"use client";

import React from "react";
import styles from "./resume-themes.module.css";

// Professional Theme - Clean, traditional, corporate
export function ProfessionalTheme({ data }) {
  const { contactInfo, summary, skills, experience, education, projects, userName } = data;

  return (
    <div className={styles.professionalTheme}>
      <h1>{userName || "Your Name"}</h1>
      
      {contactInfo && (
        <div className={styles.professionalContact}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.mobile && <span> | {contactInfo.mobile}</span>}
          {contactInfo.linkedin && <span> | LinkedIn</span>}
        </div>
      )}

      {summary && (
        <div className="section">
          <h2>Professional Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {skills && (
        <div className="section">
          <h2>Skills</h2>
          <p>{skills}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div className="section">
          <h2>Work Experience</h2>
          {experience.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span>{entry.title} @ {entry.organization}</span>
                <span className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </span>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {education && education.length > 0 && (
        <div className="section">
          <h2>Education</h2>
          {education.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span>{entry.title} @ {entry.organization}</span>
                <span className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </span>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="section">
          <h2>Projects</h2>
          {projects.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <span>{entry.title} @ {entry.organization}</span>
                <span className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </span>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Creative Theme - Colorful, modern, design-focused
export function CreativeTheme({ data }) {
  const { contactInfo, summary, skills, experience, education, projects, userName } = data;

  return (
    <div className="creative-theme bg-gradient-to-br from-purple-50 to-pink-50 text-gray-900 p-8 max-w-4xl mx-auto">
      <style jsx>{`
        .creative-theme {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.7;
        }
        .creative-theme h1 {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .creative-theme h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #764ba2;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-left: 1rem;
          border-left: 5px solid #764ba2;
        }
        .creative-theme h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
          margin-top: 1.25rem;
        }
        .creative-theme .contact-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }
        .creative-theme .contact-item {
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .creative-theme .section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .creative-theme .entry {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px dashed #e5e7eb;
        }
        .creative-theme .entry:last-child {
          border-bottom: none;
        }
        .creative-theme .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }
        .creative-theme .entry-title {
          font-weight: 700;
          color: #667eea;
        }
        .creative-theme .entry-date {
          color: #764ba2;
          font-weight: 600;
          font-size: 0.9rem;
        }
      `}</style>
      
      <h1>{userName || "Your Name"}</h1>
      
      {contactInfo && (
        <div className="contact-info">
          {contactInfo.email && <div className="contact-item">{contactInfo.email}</div>}
          {contactInfo.mobile && <div className="contact-item">{contactInfo.mobile}</div>}
          {contactInfo.linkedin && <div className="contact-item">LinkedIn</div>}
        </div>
      )}

      {summary && (
        <div className="section">
          <h2>Professional Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {skills && (
        <div className="section">
          <h2>Skills</h2>
          <p>{skills}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div className="section">
          <h2>Work Experience</h2>
          {experience.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>@{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {education && education.length > 0 && (
        <div className="section">
          <h2>Education</h2>
          {education.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>@{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="section">
          <h2>Projects</h2>
          {projects.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>@{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Modern Theme - Sleek, minimalist, tech-focused
export function ModernTheme({ data }) {
  const { contactInfo, summary, skills, experience, education, projects, userName } = data;

  return (
    <div className="modern-theme bg-white text-gray-900 p-10 max-w-5xl mx-auto">
      <style jsx>{`
        .modern-theme {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          line-height: 1.7;
        }
        .modern-theme .header-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }
        .modern-theme h1 {
          font-size: 2.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .modern-theme .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
        }
        .modern-theme h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .modern-theme .section-content {
          display: grid;
          gap: 1.5rem;
        }
        .modern-theme .entry {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 1rem;
        }
        .modern-theme .entry-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .modern-theme .entry-content .organization {
          color: #6b7280;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }
        .modern-theme .entry-date {
          color: #9ca3af;
          font-size: 0.85rem;
          text-align: right;
        }
        .modern-theme p {
          color: #374151;
          font-size: 0.95rem;
        }
      `}</style>
      
      <div className="header-section">
        <div>
          <h1>{userName || "Your Name"}</h1>
        </div>
        {contactInfo && (
          <div className="contact-info">
            {contactInfo.email && <div>{contactInfo.email}</div>}
            {contactInfo.mobile && <div>{contactInfo.mobile}</div>}
            {contactInfo.linkedin && <div>LinkedIn</div>}
          </div>
        )}
      </div>

      {summary && (
        <div>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {skills && (
        <div>
          <h2>Skills</h2>
          <p>{skills}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div>
          <h2>Experience</h2>
          <div className="section-content">
            {experience.map((entry, idx) => (
              <div key={idx} className="entry">
                <div className="entry-content">
                  <h3>{entry.title}</h3>
                  <div className="organization">{entry.organization}</div>
                  <p>{entry.description}</p>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div>
          <h2>Education</h2>
          <div className="section-content">
            {education.map((entry, idx) => (
              <div key={idx} className="entry">
                <div className="entry-content">
                  <h3>{entry.title}</h3>
                  <div className="organization">{entry.organization}</div>
                  <p>{entry.description}</p>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div>
          <h2>Projects</h2>
          <div className="section-content">
            {projects.map((entry, idx) => (
              <div key={idx} className="entry">
                <div className="entry-content">
                  <h3>{entry.title}</h3>
                  <div className="organization">{entry.organization}</div>
                  <p>{entry.description}</p>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimalist Theme - Ultra-clean, simple, elegant
export function MinimalistTheme({ data }) {
  const { contactInfo, summary, skills, experience, education, projects, userName } = data;

  return (
    <div className="minimalist-theme bg-white text-gray-900 p-12 max-w-4xl mx-auto">
      <style jsx>{`
        .minimalist-theme {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          line-height: 1.8;
          font-size: 0.95rem;
        }
        .minimalist-theme .header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .minimalist-theme h1 {
          font-size: 2.5rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #111827;
          margin-bottom: 1rem;
        }
        .minimalist-theme .contact-info {
          font-size: 0.85rem;
          color: #6b7280;
          letter-spacing: 0.05em;
        }
        .minimalist-theme .contact-info span {
          margin: 0 0.75rem;
        }
        .minimalist-theme h2 {
          font-size: 1rem;
          font-weight: 400;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .minimalist-theme .section {
          margin-bottom: 2rem;
        }
        .minimalist-theme .entry {
          margin-bottom: 1.5rem;
        }
        .minimalist-theme .entry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .minimalist-theme .entry-title {
          font-weight: 500;
          color: #111827;
        }
        .minimalist-theme .entry-org {
          color: #6b7280;
          font-weight: 300;
        }
        .minimalist-theme .entry-date {
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 300;
        }
        .minimalist-theme p {
          color: #374151;
          font-weight: 300;
        }
      `}</style>
      
      <div className="header">
        <h1>{userName || "Your Name"}</h1>
        {contactInfo && (
          <div className="contact-info">
            {contactInfo.email && <span>{contactInfo.email}</span>}
            {contactInfo.mobile && <span>{contactInfo.mobile}</span>}
            {contactInfo.linkedin && <span>LinkedIn</span>}
          </div>
        )}
      </div>

      {summary && (
        <div className="section">
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {skills && (
        <div className="section">
          <h2>Skills</h2>
          <p>{skills}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div className="section">
          <h2>Experience</h2>
          {experience.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-org">{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {education && education.length > 0 && (
        <div className="section">
          <h2>Education</h2>
          {education.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-org">{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="section">
          <h2>Projects</h2>
          {projects.map((entry, idx) => (
            <div key={idx} className="entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{entry.title}</div>
                  <div className="entry-org">{entry.organization}</div>
                </div>
                <div className="entry-date">
                  {entry.startDate} - {entry.current ? "Present" : entry.endDate}
                </div>
              </div>
              <p>{entry.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Theme selector component
export function ThemeSelector({ selectedTheme, onThemeChange }) {
  const themes = [
    { id: "professional", name: "Professional", description: "Traditional, corporate style" },
    { id: "creative", name: "Creative", description: "Colorful, design-focused" },
    { id: "modern", name: "Modern", description: "Sleek, tech-focused" },
    { id: "minimalist", name: "Minimalist", description: "Ultra-clean, elegant" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Resume Theme</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedTheme === theme.id
                ? "border-primary bg-primary/10"
                : "border-gray-200 hover:border-primary/50"
            }`}
          >
            <div className="font-semibold text-lg">{theme.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{theme.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Theme renderer component
export function ThemeRenderer({ theme, data }) {
  switch (theme) {
    case "professional":
      return <ProfessionalTheme data={data} />;
    case "creative":
      return <CreativeTheme data={data} />;
    case "modern":
      return <ModernTheme data={data} />;
    case "minimalist":
      return <MinimalistTheme data={data} />;
    default:
      return <ProfessionalTheme data={data} />;
  }
}

