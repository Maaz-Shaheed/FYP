"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Search, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Papa from "papaparse";

export default function JobBasedInterviewPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedJobs = results.data
            .filter((row) => row.title && row.description) // Filter out invalid rows
            .map((row, index) => ({
              id: row.job_id || `job-${index}`,
              company: row.company_name || "Company not specified",
              title: row.title,
              description: row.description,
              location: row.location || "Location not specified",
              salary: row.max_salary ? `$${parseFloat(row.max_salary).toLocaleString()}` : null,
              workType: row.formatted_work_type || row.work_type || "Not specified",
              experienceLevel: row.formatted_experience_level || "Not specified",
              url: row.job_posting_url || null,
            }));

          if (parsedJobs.length === 0) {
            toast.error("No valid job postings found in the CSV file");
            setIsUploading(false);
            return;
          }

          setJobs(parsedJobs);
          setFilteredJobs(parsedJobs);
          toast.success(`Successfully loaded ${parsedJobs.length} job postings`);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          toast.error("Error parsing CSV file. Please check the format.");
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast.error("Error reading CSV file. Please try again.");
        setIsUploading(false);
      },
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(value.toLowerCase()) ||
        job.company.toLowerCase().includes(value.toLowerCase()) ||
        job.location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleSelectJob = (job) => {
    setSelectedJobId(job.id);
    // Store job data in sessionStorage to avoid URL length issues
    try {
      sessionStorage.setItem(`job_${job.id}`, JSON.stringify(job));
      router.push(`/interview/jobs/quiz?id=${job.id}`);
    } catch (error) {
      console.error("Error storing job data:", error);
      toast.error("Failed to load job. Please try again.");
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-6xl font-bold text-foreground">Job-Based Interview Prep</h1>
          <p className="text-muted-foreground">
            Upload a CSV file with job postings and practice with role-specific questions
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {jobs.length === 0 && (
        <Card className="glass border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Job Postings CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file containing job postings. The file should include columns like:
              <code className="block mt-2 p-2 bg-muted rounded text-xs">
                job_id, company_name, title, description, location, max_salary, work_type
              </code>
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose CSV File"}
              </Button>
              {jobs.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setJobs([]);
                    setFilteredJobs([]);
                    setSearchTerm("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      {jobs.length > 0 && (
        <>
          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="glass border-2 border-primary/20 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl"
                onClick={() => handleSelectJob(job)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectJob(job);
                      }}
                      className="group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      Prepare
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    {job.workType && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{job.workType}</span>
                      </div>
                    )}
                  </div>
                  <div className="line-clamp-3 text-sm text-muted-foreground">
                    {job.description.substring(0, 200)}
                    {job.description.length > 200 && "..."}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No jobs found matching your search.</p>
            </div>
          )}

          {/* Clear Jobs Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setJobs([]);
                setFilteredJobs([]);
                setSearchTerm("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Clear All Jobs
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

