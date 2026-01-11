// Helper function to parse markdown resume content into structured data
export function parseResumeData(markdown, formValues, userName) {
  // Use form values if available, otherwise try to parse from markdown
  const data = {
    userName: userName || "",
    contactInfo: formValues?.contactInfo || {},
    summary: formValues?.summary || "",
    skills: formValues?.skills || "",
    experience: formValues?.experience || [],
    education: formValues?.education || [],
    projects: formValues?.projects || [],
  };

  // If form values are not available, try to parse from markdown
  if (!formValues || Object.keys(formValues).length === 0) {
    // Basic parsing from markdown (fallback)
    const lines = markdown.split("\n");
    let currentSection = "";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith("##")) {
        currentSection = line.replace(/^##\s*/, "").toLowerCase();
      } else if (line.startsWith("###")) {
        // Entry header
        const match = line.match(/###\s*(.+?)\s*@\s*(.+)/);
        if (match) {
          const [, title, org] = match;
          // This is a simplified parser - full implementation would track entries
        }
      }
    }
  }

  return data;
}



