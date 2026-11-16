 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InspectorPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [inspectorNotes, setInspectorNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // ෆොටෝස් තෝරාගැනීම සහ අප්ලෝඩ් ප්‍රගතිය සඳහා States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    setUser(user);

    const { data: available } = await supabase.from("qc_jobs").select("*").eq("status", "Awaiting Inspector");
    const { data: mine } = await supabase.from("qc_jobs").select("*").eq("inspector_id", user.id);

    if (available) setAvailableJobs(available);
    if (mine) setMyJobs(mine);
    setLoading(false);
  };

  const handleApplyJob = async (jobId: string) => {
    if (!user) return;
    const { error } = await supabase.from("qc_jobs").update({ status: "Pending Admin Approval", inspector_id: user.id }).eq("job_id", jobId);
    if (!error) {
      alert(`Job ${jobId} සඳහා සාර්ථකව ඉල්ලුම් කළා.`);
      fetchJobs(); 
    } else {
      alert("Error applying for job: " + error.message);
    }
  };

  const openUploadModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setInspectorNotes("");
    setSelectedFiles([]); 
    setUploadStatus("");
    setIsModalOpen(true);
  };

  // ෆොටෝස් තේරූ විට State එකට ගැනීම
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // සම්පූර්ණ දත්ත සහ ෆොටෝස් Supabase Storage වෙත යැවීමේ Function එක
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one inspection photo.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Preparing photo uploads...");

    let uploadedUrls: string[] = [];

    try {
      // 1. තෝරාගත් ෆොටෝස් එකින් එක Supabase Storage ('qc-photos' bucket) වෙත යැවීම
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadStatus(`Uploading photo ${i + 1} of ${selectedFiles.length}...`);
        
        const fileExt = file.name.split('.').pop() || 'jpg';
       const fileName = `${selectedJobId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("qc-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. අප්ලෝඩ් වුණු ෆොටෝ එකේ Public URL එක ලබාගැනීම
        const { data: { publicUrl } } = supabase.storage
          .from("qc-photos")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setUploadStatus("Saving inspection data to database...");

      // 3. Database එක අලුත් කිරීම (Notes සහ Photo Links සමග)
      const { error: dbError } = await supabase
        .from("qc_jobs")
        .update({ 
          status: "Awaiting AI Report", 
          special_notes: inspectorNotes,
          image_urls: uploadedUrls 
        })
        .eq("job_id", selectedJobId);

      if (dbError) throw dbError;

      alert("Inspection Data & Photos Uploaded Successfully! Sent for AI Report generation.");
      setIsModalOpen(false);
      fetchJobs();

    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Error uploading data: " + error.message);
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const pendingEarnings = myJobs.filter(job => job.status === "In Progress" || job.status === "Pending Admin Approval" || job.status === "Awaiting AI Report").length * 40;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-10 relative">
      
      {/* ---------------- UPLOAD MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060913] border border-purple-500/35 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Upload Inspection Data</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job ID</label>
                <input type="text" value={selectedJobId} disabled className="w-full bg-white/5 border border-white/10 text-emerald-400 font-bold rounded-xl px-4 py-3" />
              </div>

              {/* REAL PHOTO UPLOAD FIELD */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Factory Photos</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 transition cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-emerald-400 mt-2 font-medium">
                    ✓ {selectedFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rough Notes / Observations</label>
                <textarea 
                  rows={4} required 
                  value={inspectorNotes} onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="e.g. Quality is good. Counted 500 pcs, packaging verified." 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              {uploadStatus && <p className="text-sm text-purple-400 font-bold animate-pulse text-center">{uploadStatus}</p>}

              <div className="flex gap-3 mt-6">
                <button type="button" disabled={isUploading} onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading || !inspectorNotes || selectedFiles.length === 0} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                  {isUploading ? "Uploading..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MAIN DASHBOARD CONTENT ---------------- */}
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center bg-[#0B1120] border border-white/10 p-6 rounded-3xl mb-8 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Inspector Hub 🕵️‍♂️</h1>
            <p className="text-slate-400 text-sm">Apply for jobs, inspect factories, and upload live reports.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Estimated Earnings</p>
            <p className="text-xl font-bold text-emerald-400">${pendingEarnings.toFixed(2)}</p>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab("available")} className={`px-6 py-3 rounded-xl font-bold text-sm transition ${activeTab === "available" ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]" : "bg-[#0B1120] text-slate-400 hover:text-white border border-white/10"}`}>
            Available Jobs ({availableJobs.length})
          </button>
          <button onClick={() => setActiveTab("myjobs")} className={`px-6 py-3 rounded-xl font-bold text-sm transition ${activeTab === "myjobs" ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]" : "bg-[#0B1120] text-slate-400 hover:text-white border border-white/10"}`}>
            My Applications & Jobs ({myJobs.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            {activeTab === "available" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableJobs.length === 0 ? (
                  <p className="text-slate-500 col-span-2 text-center py-10">No available inspection jobs right now.</p>
                ) : (
                  availableJobs.map(job => (
                    <div key={job.job_id} className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-xs font-bold">{job.job_id}</span>
                        <span className="text-xl font-bold text-emerald-400">${job.payout || 40}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{job.product_name}</h3>
                      <p className="text-sm text-slate-400 mb-6 flex items-center gap-2"><span>📍</span> {job.location || "China Factory"}</p>
                      <button onClick={() => handleApplyJob(job.job_id)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition">
                        Apply for this Job
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "myjobs" && (
              <div className="space-y-6">
                {myJobs.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">You haven't applied for any jobs yet.</p>
                ) : (
                  myJobs.map(job => (
                    <div key={job.job_id} className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <div className="flex gap-2 mb-2">
                          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">{job.job_id}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            job.status === 'Pending Admin Approval' ? 'bg-orange-500/20 text-orange-400' 
                            : job.status === 'Awaiting AI Report' ? 'bg-blue-500/20 text-blue-400' 
                            : job.status === 'Report Ready' ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{job.product_name}</h3>
                      </div>
                      
                      {job.status === "Pending Admin Approval" ? (
                        <div className="text-sm text-orange-400 font-medium">⏳ Waiting for Admin Approval...</div>
                      ) : job.status === "In Progress" ? (
                        <button onClick={() => openUploadModal(job.job_id)} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                          📸 Upload Photos & Notes
                        </button>
                      ) : (
                        <div className="text-sm text-slate-400 font-medium">✅ Inspection Completed & Submitted</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}