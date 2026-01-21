import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { getEffectiveRole } from "../../utils/dashboardPath";
import "../../App.css";
import "./Recruitment.css";

const Recruitment = () => {
  const {
    currentUser,
    listRecruitmentCandidates,
    createRecruitmentCandidate,
    generateRecruitmentCandidateEmpId,
    listRecruitmentCandidateDocuments,
    uploadRecruitmentCandidateDocument,
  } = useAuth();
  const { addNotification } = useNotifications();
  const [activeModule, setActiveModule] = useState(null);
  const [activeSubModule, setActiveSubModule] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [candidateEmpId, setCandidateEmpId] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [errors, setErrors] = useState({});
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      name: "",
      dateOfBirth: "",
      contactNumber: "",
      resume: null,
      resumeName: "",
    },
    documents: {
      candidateType: "fresher",
      resume: null,
      resumeName: "",
      aadhar: null,
      aadharName: "",
      pan: null,
      panName: "",
      edu10th: null,
      edu10thName: "",
      edu12th: null,
      edu12thName: "",
      eduGraduation: null,
      eduGraduationName: "",
      eduPg: null,
      eduPgName: "",
      passportPhotos: null,
      passportPhotosName: "",
      addressProof: null,
      addressProofName: "",
      bankProof: null,
      bankProofName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      bankName: "",
      bankBranch: "",

      updatedResume: null,
      updatedResumeName: "",
      experienceCertificates: null,
      experienceCertificatesName: "",
      salarySlips: null,
      salarySlipsName: "",
      bankStatements: null,
      bankStatementsName: "",
      previousCompanyOfferLetter: null,
      previousCompanyOfferLetterName: "",
      lastWorkingDayAcceptance: null,
      lastWorkingDayAcceptanceName: "",
      form16: null,
      form16Name: "",
      uanEsiDetails: null,
      uanEsiDetailsName: "",
    },
    offerLetter: {
      position: "",
      proposedJoiningDate: "",
      salaryPackage: "",
      issued: false,
      status: "pending",
    },
    joining: {
      joiningDate: "",
      department: "",
      designation: "",
      reportingManager: "",
      induction: "",
    },
    dropout: {
      reason: "",
      remarks: "",
    },
  });

  const effRole = getEffectiveRole(currentUser);
  const isHR = effRole === 'hr';
  const isAdmin = effRole === 'admin';

  const modules = [
    {
      id: 'personal',
      name: 'Personal Info',
      subModules: [
        { id: 'basic-details', name: 'Basic Details' },
      ]
    },  
    {
      id: 'documents',
      name: 'Document Verification',
      subModules: [
        { id: 'doc-resume', name: 'Resume' },
        { id: 'doc-govt-id', name: 'Government ID Proof (Aadhar/PAN)' },
        { id: 'doc-education', name: 'Educational Certificates' },
        { id: 'doc-photos', name: 'Passport Size Photos' },
        { id: 'doc-address', name: 'Address Proof' },
        { id: 'doc-bank', name: 'Bank Account Details' },
        { id: 'doc-experienced', name: 'Experienced Candidate Documents' },
      ]
    },
    {
      id: 'offer-letter',
      name: 'Offer Letter',
      subModules: [
        { id: 'issue-letter', name: 'Issue Offer Letter' },
        { id: 'track-status', name: 'Track Acceptance Status' },
        { id: 'candidate-dropout', name: 'Candidate Dropout' }
      ]
    },
    {
      id: 'joining',
      name: 'Joining Details',
      subModules: [
        { id: 'joining-form', name: 'Joining Form' },
        { id: 'employee-id', name: 'Employee ID Generation' }
      ]
    }
  ];

  const isJoiningUnlocked = formData.offerLetter.status === 'accepted';

  const startNewCandidate = () => {
    setCandidateName('new');
    setCandidateId('');
    setUploadedDocs({});
    setErrors({});
    setShowCandidateDetails(false);
    setFormData({
      personalInfo: {
        name: "",
        dateOfBirth: "",
        contactNumber: "",
        resume: null,
        resumeName: "",
      },
      documents: {
        candidateType: "fresher",
        resume: null,
        resumeName: "",
        aadhar: null,
        aadharName: "",
        pan: null,
        panName: "",
        edu10th: null,
        edu10thName: "",
        edu12th: null,
        edu12thName: "",
        eduGraduation: null,
        eduGraduationName: "",
        eduPg: null,
        eduPgName: "",
        passportPhotos: null,
        passportPhotosName: "",
        addressProof: null,
        addressProofName: "",
        bankProof: null,
        bankProofName: "",
        bankAccountNumber: "",
        bankIfscCode: "",
        bankName: "",
        bankBranch: "",
        updatedResume: null,
        updatedResumeName: "",
        experienceCertificates: null,
        experienceCertificatesName: "",
        salarySlips: null,
        salarySlipsName: "",
        bankStatements: null,
        bankStatementsName: "",
        previousCompanyOfferLetter: null,
        previousCompanyOfferLetterName: "",
        lastWorkingDayAcceptance: null,
        lastWorkingDayAcceptanceName: "",
        form16: null,
        form16Name: "",
        uanEsiDetails: null,
        uanEsiDetailsName: "",
      },
      offerLetter: {
        position: "",
        proposedJoiningDate: "",
        salaryPackage: "",
        issued: false,
        status: "pending",
      },
      joining: {
        joiningDate: "",
        department: "",
        designation: "",
        reportingManager: "",
        induction: "",
      },
      dropout: {
        reason: "",
        remarks: "",
      },
    });
    const personal = modules.find((m) => m.id === 'personal') || modules[0];
    setActiveModule(personal);
    setActiveSubModule(personal?.subModules?.[0] || null);
  };

  const downloadFilesForSelectedCandidate = () => {
    if (!candidateId) {
      addNotification({
        title: 'No candidate selected',
        message: 'Please select a candidate first.',
        type: 'info',
        ttl: 3000,
      });
      return;
    }

    const API = (import.meta.env && import.meta.env.VITE_API_BASE)
      ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '')
      : '/api';
    const url = `${API}/recruitment/candidates/${encodeURIComponent(candidateId)}/documents/zip`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {}
  };

  const openWorkflowForSelectedCandidate = () => {
    setShowCandidateDetails(false);
    setErrors({});

    // Hydrate form fields from selected candidate so workflow doesn't look like a new candidate
    const c = (candidates || []).find((x) => x.id === candidateId);
    if (c) {
      setFormData((prev) => ({
        ...(prev || {}),
        personalInfo: {
          ...(prev?.personalInfo || {}),
          name: c?.name || '',
          dateOfBirth: c?.dateOfBirth || '',
          contactNumber: c?.contactNumber || '',
        },
        documents: {
          ...(prev?.documents || {}),
          candidateType: c?.candidateType || prev?.documents?.candidateType || 'fresher',
        },
      }));
    }

    const personal = modules.find((m) => m.id === 'personal') || modules[0];
    setActiveModule(personal);
    setActiveSubModule(personal?.subModules?.[0] || null);
  };

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const rows = await listRecruitmentCandidates({ limit: 200, offset: 0 });
        setCandidates(Array.isArray(rows) ? rows : []);
      } catch {
        setCandidates([]);
      }
    };
    loadCandidates();
  }, [listRecruitmentCandidates]);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        if (!candidateId) return;
        const rows = await listRecruitmentCandidateDocuments(candidateId);
        const next = {};
        if (Array.isArray(rows)) {
          for (const r of rows) {
            const k = String(r?.docType || '').toLowerCase();
            if (!k) continue;
            if (!next[k]) next[k] = [];
            next[k].push(r);
          }
        }
        setUploadedDocs(next);
      } catch {
        setUploadedDocs({});
      }
    };
    loadDocs();
  }, [candidateId, listRecruitmentCandidateDocuments]);

  const syncCandidateSelection = (id) => {
    setCandidateId(id || '');
    setCandidateName(id || '');
    setCandidateEmpId('');
    setErrors({});
    setShowCandidateDetails(!!id);
    setActiveModule(null);
    setActiveSubModule(null);
  };

  useEffect(() => {
    const loadEmpId = async () => {
      try {
        if (!candidateId) {
          setCandidateEmpId('');
          return;
        }
        const c = (candidates || []).find((x) => x.id === candidateId);
        if (c?.empId) {
          setCandidateEmpId(String(c.empId));
          return;
        }
        // Ensure empId exists (HR-only endpoint)
        const out = await generateRecruitmentCandidateEmpId(candidateId);
        const eid = out?.empId ? String(out.empId) : '';
        setCandidateEmpId(eid);
        if (eid) {
          setCandidates((prev) => (prev || []).map((row) => (row?.id === candidateId ? { ...(row || {}), empId: eid } : row)));
        }
      } catch {
        setCandidateEmpId('');
      }
    };
    loadEmpId();
  }, [candidateId, candidates, generateRecruitmentCandidateEmpId]);

  const hasUploadedDoc = (docType) => {
    const k = String(docType || '').toLowerCase();
    const arr = uploadedDocs && uploadedDocs[k] ? uploadedDocs[k] : null;
    return Array.isArray(arr) ? arr.length > 0 : !!arr;
  };

  const recordUploadedDoc = (docType, doc) => {
    setUploadedDocs((prev) => {
      const next = { ...(prev || {}) };
      if (!next[docType]) next[docType] = [];
      next[docType] = [doc, ...next[docType]];
      return next;
    });
  };

  const getLatestDocUrl = (docType) => {
    const k = String(docType || '').toLowerCase();
    const arr = uploadedDocs && uploadedDocs[k] ? uploadedDocs[k] : null;
    const d = Array.isArray(arr) && arr.length ? arr[0] : null;
    return d && d.url ? d.url : '';
  };

  const uploadDoc = async ({ docType, file }) => {
    if (!candidateId) {
      addNotification({
        title: 'Candidate not created',
        message: 'Please complete Personal Info first to create the candidate record.',
        type: 'error',
        ttl: 3500,
      });
      return null;
    }
    const doc = await uploadRecruitmentCandidateDocument({ candidateId, docType, file });
    recordUploadedDoc(String(docType || '').toLowerCase(), doc);
    return doc;
  };

  const handleModuleClick = (module) => {
    if (module?.id === 'joining' && !isJoiningUnlocked) {
      addNotification({
        title: 'Joining Details locked',
        message: 'Joining Details will be available only after the Offer Letter is accepted.',
        type: 'info',
        ttl: 4000,
      });
      return;
    }
    setActiveModule(module);
    const firstSub = module?.subModules?.[0] || null;
    if (module.id === "personal") {
      setActiveSubModule({ id: "basic-details", name: "Personal Info" });
      return;
    }
    setActiveSubModule(firstSub);
  };

  const setModuleAndSubmodule = (moduleId, subModuleId) => {
    const mod = modules.find((m) => m.id === moduleId) || null;
    if (!mod) return;
    const sub = (mod.subModules || []).find((s) => s.id === subModuleId) || null;
    setActiveModule(mod);
    setActiveSubModule(sub);
  };

  const handleOfferDecision = (decision) => {
    if (!formData.offerLetter.issued) {
      addNotification({
        title: "Offer letter not issued",
        message: "Please mark the offer letter as issued before recording acceptance/rejection.",
        type: "error",
        ttl: 4000,
      });
      return;
    }

    if (decision !== "accepted" && decision !== "rejected") return;

    setFormData((prev) => ({
      ...prev,
      offerLetter: {
        ...prev.offerLetter,
        status: decision,
        decidedAt: new Date().toISOString()
      },
    }));

    if (decision === "accepted") {
      addNotification({
        title: "Offer accepted",
        message: "Proceed to Joining Details.",
        type: "success",
        ttl: 3000,
      });
      setActiveModule(modules.find(m => m.id === 'joining'));
      setActiveSubModule({ id: 'joining-form', name: 'Joining Form' });
      return;
    }

    addNotification({
      title: "Offer rejected",
      message: "Please capture the dropout reason.",
      type: "info",
      ttl: 3000,
    });
    setActiveModule(modules.find(m => m.id === 'offer-letter'));
    setActiveSubModule({ id: 'candidate-dropout', name: 'Candidate Dropout' });
    setModuleAndSubmodule("offer-letter", "candidate-dropout");
  };

  const handleSubModuleClick = (subModule) => {
    if (activeModule?.id === 'joining' && !isJoiningUnlocked) {
      addNotification({
        title: 'Joining Details locked',
        message: 'Joining Details will be available only after the Offer Letter is accepted.',
        type: 'info',
        ttl: 4000,
      });
      return;
    }
    setActiveSubModule(subModule);
  };

  const handleInputChange = (section, field, value) => {
    try { setErrors((prev) => {
      const k = `${section}.${field}`;
      if (!prev || !prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    }); } catch {}
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (e, section, field, options = {}) => {
    const { allowed = "pdf", multiple = false } = options;
    const files = Array.from(e.target.files || []).filter(Boolean);
    if (files.length === 0) return;

    const isAllowed = (file) => {
      const type = (file?.type || "").toLowerCase();
      const name = (file?.name || "").toLowerCase();
      if (allowed === "image") return (file.type || "").startsWith("image/");
      if (allowed === "pdfOrImage") {
        return file.type === "application/pdf" || (file.type || "").startsWith("image/");
      }
      return true;
    };

    if (!files.every(isAllowed)) {
      addNotification({
        title: "Invalid file",
        message:
          allowed === "image"
            ? "Please upload image files only (JPG/PNG)."
            : allowed === "pdfOrImage"
              ? "Please upload PDF or image files only (PDF/JPG/PNG)."
              : "Please upload a PDF file only.",
        type: "error",
        ttl: 4000,
      });
      e.target.value = "";
      return;
    }

    const value = multiple ? files : files[0];
    const valueName = multiple ? files.map((f) => f.name).join(", ") : files[0].name;

    try { setErrors((prev) => {
      const k = `${section}.${field}`;
      if (!prev || !prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    }); } catch {}

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
        [`${field}Name`]: valueName,
      },
    }));

    // Upload immediately only after candidate is created
    try {
      if (!candidateId) return;
      const docType = field;
      if (multiple) {
        for (const f of files) {
          await uploadDoc({ docType, file: f });
        }
      } else {
        await uploadDoc({ docType, file: files[0] });
      }
    } catch (err) {
      addNotification({
        title: 'Upload failed',
        message: err?.message || 'Unable to upload document',
        type: 'error',
        ttl: 4000,
      });
    }
  };

  const isPersonalInfoValid =
    !!formData.personalInfo.name &&
    !!formData.personalInfo.contactNumber &&
    (!!formData.personalInfo.resume || hasUploadedDoc('resume'));

  const hasFile = (v) => (Array.isArray(v) ? v.length > 0 : !!v);

  const isDocumentsStepValid = () => {
    if (!activeSubModule) return false;
    const d = formData.documents;

    switch (activeSubModule.id) {
      case "doc-resume":
        return !!d.candidateType;
      case "doc-govt-id":
        return (hasFile(d.aadhar) || hasUploadedDoc('aadhar')) && (hasFile(d.pan) || hasUploadedDoc('pan'));
      case "doc-education":
        return (hasFile(d.edu10th) || hasUploadedDoc('edu10th')) && (hasFile(d.edu12th) || hasUploadedDoc('edu12th')) && (hasFile(d.eduGraduation) || hasUploadedDoc('edugraduation'));
      case "doc-photos":
        return hasFile(d.passportPhotos) || hasUploadedDoc('passportphotos');
      case "doc-address":
        return hasFile(d.addressProof) || hasUploadedDoc('addressproof');
      case "doc-bank":
        return hasFile(d.bankProof) || hasUploadedDoc('bankproof');
      case "doc-experienced":
        if (d.candidateType !== "experienced") return true;
        return (
          (hasFile(d.updatedResume) || hasUploadedDoc('updatedresume')) &&
          (hasFile(d.experienceCertificates) || hasUploadedDoc('experiencecertificates')) &&
          (hasFile(d.salarySlips) || hasUploadedDoc('salaryslips')) &&
          (hasFile(d.bankStatements) || true) &&
          (hasFile(d.previousCompanyOfferLetter) || hasUploadedDoc('previouscompanyofferletter')) &&
          (hasFile(d.lastWorkingDayAcceptance) || hasUploadedDoc('lastworkingdayacceptance')) &&
          (hasFile(d.form16) || true) &&
          (hasFile(d.uanEsiDetails) || hasUploadedDoc('uanesidetails'))
        );
      default:
        return true;
    }
  };

  const getStepValidationMessage = () => {
    if (!activeSubModule) return '';
    const d = formData.documents;
    switch (activeSubModule.id) {
      case 'basic-details':
        return 'Please fill Name, Contact Number and upload Resume.';
      case 'doc-govt-id':
        return 'Please upload both Aadhar and PAN.';
      case 'doc-education':
        return 'Please upload 10th, 12th and Graduation certificates.';
      case 'doc-photos':
        return 'Please upload passport size photos.';
      case 'doc-address':
        return 'Please upload address proof.';
      case 'doc-bank':
        if (d.bankProof) return '';
        return 'Please upload bank proof OR fill all bank details.';
      case 'doc-experienced':
        if (d.candidateType !== 'experienced') return '';
        return 'Please upload all required experienced candidate documents.';
      case 'joining-form':
        return 'Please fill all joining details.';
      default:
        return 'Please complete all required fields.';
    }
  };

  const focusField = (id) => {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') el.focus();
    } catch {}
  };

  const setFieldError = (key, message) => {
    setErrors((prev) => ({ ...(prev || {}), [key]: message }));
  };

  const validateCurrentStep = () => {
    const step = activeSubModule?.id || '';
    const nextErrors = {};
    let firstFocusId = '';

    const setErr = (key, message, focusId) => {
      nextErrors[key] = message;
      if (!firstFocusId && focusId) firstFocusId = focusId;
    };

    const d = formData.documents;

    if (step === 'basic-details') {
      if (!formData.personalInfo.name) setErr('personalInfo.name', 'Name is required', 'rec_personal_name');
      if (!formData.personalInfo.dateOfBirth) setErr('personalInfo.dateOfBirth', 'Date of Birth is required', 'rec_personal_dateOfBirth');
      if (!formData.personalInfo.contactNumber) setErr('personalInfo.contactNumber', 'Contact Number is required', 'rec_personal_contact');
      if (!formData.personalInfo.resume && !hasUploadedDoc('resume')) setErr('personalInfo.resume', 'Resume is required', 'rec_personal_resume');
    }

    if (step === 'doc-govt-id') {
      if (!d.aadhar && !hasUploadedDoc('aadhar')) setErr('documents.aadhar', 'Aadhar is required', 'rec_doc_aadhar');
      if (!d.pan && !hasUploadedDoc('pan')) setErr('documents.pan', 'PAN is required', 'rec_doc_pan');
    }

    if (step === 'doc-resume') {
      if (!d.candidateType) setErr('documents.candidateType', 'Candidate Type is required', 'rec_doc_candidateType');
    }

    if (step === 'doc-education') {
      if (!d.edu10th && !hasUploadedDoc('edu10th')) setErr('documents.edu10th', '10th documents are required', 'rec_doc_edu10th');
      if (!d.edu12th && !hasUploadedDoc('edu12th')) setErr('documents.edu12th', '12th documents are required', 'rec_doc_edu12th');
      if (!d.eduGraduation && !hasUploadedDoc('edugraduation')) setErr('documents.eduGraduation', 'Graduation documents are required', 'rec_doc_eduGraduation');
    }

    if (step === 'doc-photos') {
      if ((!d.passportPhotos || (Array.isArray(d.passportPhotos) && d.passportPhotos.length === 0)) && !hasUploadedDoc('passportphotos')) {
        setErr('documents.passportPhotos', 'Passport size photos are required', 'rec_doc_passportPhotos');
      }
    }

    if (step === 'doc-address') {
      if (!d.addressProof && !hasUploadedDoc('addressproof')) setErr('documents.addressProof', 'Address proof is required', 'rec_doc_addressProof');
    }

    if (step === 'doc-bank') {
      const hasBankProof = !!d.bankProof;
      const hasAllBank = !!(d.bankAccountNumber && d.bankIfscCode && d.bankName && d.bankBranch);
      if (!hasBankProof && !hasAllBank && !hasUploadedDoc('bankproof')) {
        setErr('documents.bankProof', 'Upload bank proof OR fill all bank details', 'rec_doc_bankProof');
        if (!d.bankAccountNumber) setErr('documents.bankAccountNumber', 'Account Number is required', 'rec_doc_bankAccountNumber');
        if (!d.bankIfscCode) setErr('documents.bankIfscCode', 'IFSC Code is required', 'rec_doc_bankIfscCode');
        if (!d.bankName) setErr('documents.bankName', 'Bank Name is required', 'rec_doc_bankName');
        if (!d.bankBranch) setErr('documents.bankBranch', 'Branch is required', 'rec_doc_bankBranch');
      }
    }

    if (step === 'doc-experienced' && d.candidateType === 'experienced') {
      if (!d.updatedResume && !hasUploadedDoc('updatedresume')) setErr('documents.updatedResume', 'Updated Resume is required', 'rec_doc_updatedResume');
      if (!d.experienceCertificates && !hasUploadedDoc('experiencecertificates')) setErr('documents.experienceCertificates', 'Experience Certificates are required', 'rec_doc_experienceCertificates');
      if (!d.salarySlips && !hasUploadedDoc('salaryslips')) setErr('documents.salarySlips', 'Salary slips are required', 'rec_doc_salarySlips');
      if (!d.previousCompanyOfferLetter && !hasUploadedDoc('previouscompanyofferletter')) setErr('documents.previousCompanyOfferLetter', 'Previous Offer Letter is required', 'rec_doc_previousCompanyOfferLetter');
      if (!d.lastWorkingDayAcceptance && !hasUploadedDoc('lastworkingdayacceptance')) setErr('documents.lastWorkingDayAcceptance', 'Last Working Day Acceptance is required', 'rec_doc_lastWorkingDayAcceptance');
      if (!d.uanEsiDetails && !hasUploadedDoc('uanesidetails')) setErr('documents.uanEsiDetails', 'UAN/ESI details are required', 'rec_doc_uanEsiDetails');
    }

    if (step === 'joining-form') {
      if (formData.offerLetter.status !== 'accepted') {
        // joining form is locked; no field errors
      } else {
        if (!formData.joining.joiningDate) setErr('joining.joiningDate', 'Joining Date is required', 'rec_joining_joiningDate');
        if (!formData.joining.department) setErr('joining.department', 'Department is required', 'rec_joining_department');
        if (!formData.joining.designation) setErr('joining.designation', 'Designation is required', 'rec_joining_designation');
        if (!formData.joining.reportingManager) setErr('joining.reportingManager', 'Reporting Manager is required', 'rec_joining_reportingManager');
        if (!formData.joining.induction) setErr('joining.induction', 'Induction is required', 'rec_joining_induction');
      }
    }

    setErrors(nextErrors);
    if (firstFocusId) focusField(firstFocusId);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!activeModule) return;

    const okStep = validateCurrentStep();
    if (!okStep) return;

    // Create candidate and upload resume on first step
    if (activeSubModule?.id === 'basic-details') {
      try {
        if (!isPersonalInfoValid) {
          addNotification({
            title: 'Missing required fields',
            message: 'Please fill Name, Contact Number and upload Resume.',
            type: 'error',
            ttl: 3500,
          });
          return;
        }

        let effectiveCandidateId = candidateId;
        if (!effectiveCandidateId) {
          const created = await createRecruitmentCandidate({
            name: formData.personalInfo.name,
            dateOfBirth: formData.personalInfo.dateOfBirth || null,
            contactNumber: formData.personalInfo.contactNumber,
            candidateType: formData.documents.candidateType || 'fresher',
          });
          if (created?.id) {
            setCandidates((prev) => [created, ...(prev || [])]);
            syncCandidateSelection(created.id);
            effectiveCandidateId = created.id;
          }
        }

        // Upload resume after candidate exists
        if (formData.personalInfo.resume && effectiveCandidateId) {
          const doc = await uploadRecruitmentCandidateDocument({
            candidateId: effectiveCandidateId,
            docType: 'resume',
            file: formData.personalInfo.resume,
          });
          recordUploadedDoc('resume', doc);
        }
      } catch (err) {
        addNotification({
          title: 'Unable to create candidate',
          message: err?.message || 'Please try again',
          type: 'error',
          ttl: 4500,
        });
        return;
      }
    }

    if (activeSubModule?.id && activeSubModule.id.startsWith('doc-')) {
      // Bank step has a custom check already; keep it in addition to this guard
      const ok = isDocumentsStepValid();
      if (!ok) {
        return;
      }
    }

    if (activeSubModule?.id === 'joining-form') {
      if (formData.offerLetter.status !== 'accepted') {
        addNotification({
          title: 'Joining Details locked',
          message: 'Joining Details will be available only after the Offer Letter is accepted.',
          type: 'info',
          ttl: 4000,
        });
        return;
      }
      if (!formData.joining.joiningDate || !formData.joining.department || !formData.joining.designation || !formData.joining.reportingManager || !formData.joining.induction) {
        addNotification({
          title: 'Incomplete Information',
          message: getStepValidationMessage(),
          type: 'error',
          ttl: 3500,
        });
        return;
      }
    }

    if (activeSubModule && Array.isArray(activeModule.subModules)) {
      const idx = activeModule.subModules.findIndex((s) => s.id === activeSubModule.id);
      if (idx >= 0 && idx < activeModule.subModules.length - 1) {
        setActiveSubModule(activeModule.subModules[idx + 1]);
        return;
      }
    }

    const currentIndex = modules.findIndex((m) => m.id === activeModule.id);
    if (currentIndex < 0) return;
    if (currentIndex < modules.length - 1) {
      const next = modules[currentIndex + 1];
      setActiveModule(next);
      setActiveSubModule(next?.subModules?.[0] || null);
    }
  };

  const handleBack = () => {
    if (!activeModule || !activeSubModule) return;

    if (Array.isArray(activeModule.subModules)) {
      const idx = activeModule.subModules.findIndex((s) => s.id === activeSubModule.id);
      if (idx > 0) {
        setActiveSubModule(activeModule.subModules[idx - 1]);
        return;
      }
    }
    setActiveSubModule(null);
  };

  const handleSave = () => {
    if (!activeSubModule) return;

    if (activeSubModule.id === 'candidate-dropout') {
      addNotification({
        title: 'Dropout saved',
        message: 'Candidate dropout reason captured.',
        type: 'success',
        ttl: 3000,
      });
      return;
    }

    if (activeSubModule.id === 'employee-id') {
      addNotification({
        title: 'Saved',
        message: 'Employee ID generation details saved.',
        type: 'success',
        ttl: 3000,
      });
    }
  };

  const renderModuleContent = () => {
    if (showCandidateDetails && candidateId) {
      const c = (candidates || []).find((x) => x.id === candidateId);
      const docs = uploadedDocs || {};
      const docKeys = Object.keys(docs);

      const details = [
        { label: 'Name', value: c?.name || '' },
        { label: 'Contact Number', value: c?.contactNumber || c?.contact_number || '' },
        { label: 'Date of Birth', value: c?.dateOfBirth || c?.date_of_birth || '' },
        { label: 'Candidate Type', value: c?.candidateType || c?.candidate_type || formData?.documents?.candidateType || '' },
      ];

      return (
        <div className="module-content">
          <div className="form-container">
            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <h3 style={{ margin: 0 }}>Candidate Details</h3>
                <div className="form-text" style={{ margin: 0, opacity: 0.8 }}>Emp ID: {candidateEmpId || '-'}</div>
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px 14px', alignItems: 'center' }}>
                  {details.map((d) => (
                    <React.Fragment key={d.label}>
                      <div className="form-text" style={{ fontWeight: 700, opacity: 0.85 }}>{d.label}</div>
                      <div className="form-text" style={{ fontWeight: 600 }}>{d.value || '-'}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <h4 style={{ marginTop: 18 }}>Uploaded Documents</h4>
              {docKeys.length === 0 ? (
                <div className="form-text">No documents uploaded yet.</div>
              ) : (
                <div className="form-group">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: '8px 12px', alignItems: 'center' }}>
                    <div className="form-text" style={{ fontWeight: 700 }}>Document</div>
                    <div className="form-text" style={{ fontWeight: 700 }}>Count</div>
                    <div className="form-text" style={{ fontWeight: 700 }}>Latest Upload</div>

                    {docKeys
                      .slice()
                      .sort((a, b) => a.localeCompare(b))
                      .map((k) => {
                        const list = Array.isArray(docs[k]) ? docs[k] : [docs[k]].filter(Boolean);
                        const latest = list[0];
                        const latestName = latest?.fileName || latest?.name || '';
                        const latestAt = latest?.uploadedAt ? String(latest.uploadedAt).slice(0, 10) : '';
                        return (
                          <React.Fragment key={k}>
                            <div className="form-text" style={{ fontWeight: 600 }}>{k}</div>
                            <div className="form-text">{list.length}</div>
                            <div className="form-text">{latestName}{latestAt ? ` (${latestAt})` : ''}</div>
                          </React.Fragment>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={openWorkflowForSelectedCandidate}>
                  Submit
                </button>
                <button type="button" className="btn btn-secondary" onClick={downloadFilesForSelectedCandidate}>
                  Download Files
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!activeModule || !activeSubModule) {
      return (
        <div className="module-content">
          <div className="welcome-card">
            <h3>Welcome to Recruitment Module</h3>
            <p>Select a module from the left sidebar to get started.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="module-content">
        <h2>{activeModule.name}</h2>
        {activeSubModule ? (
          <div className="submodule-content">
            {/* <h3>{activeSubModule.name}</h3> */}
            {/* Add specific form components for each submodule here */}
            <div className="form-container">
              {activeSubModule.id === 'basic-details' && (
                <div className="form-section">
                  {/* <h4>Personal Info</h4> */}
                  <div className="form-group">
                    <label>Name <span className="required">*</span></label>
                    <input
                      type="text"
                      id="rec_personal_name"
                      className="form-control"
                      value={formData.personalInfo.name}
                      onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                      required
                    />
                    {errors['personalInfo.name'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['personalInfo.name']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Date of Birth<span className="required">*</span></label>
                    <input
                      type="date"
                      id="rec_personal_dateOfBirth"
                      className="form-control"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                      required
                    />
                    {errors['personalInfo.dateOfBirth'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['personalInfo.dateOfBirth']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Contact Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      id="rec_personal_contact"
                      className="form-control"
                      value={formData.personalInfo.contactNumber}
                      onChange={(e) => handleInputChange("personalInfo", "contactNumber", e.target.value)}
                      required
                    />
                    {errors['personalInfo.contactNumber'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['personalInfo.contactNumber']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Resume (PDF) <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_personal_resume"
                      className="form-control"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileUpload(e, "personalInfo", "resume", { allowed: "pdf" })}
                      required
                    />
                    {formData.personalInfo.resumeName ? (
                      <div className="form-text">Selected: {formData.personalInfo.resumeName}</div>
                    ) : null}
                    {getLatestDocUrl('resume') ? (
                      <div className="form-text">
                        Uploaded: <a href={getLatestDocUrl('resume')} target="_blank" rel="noreferrer">Open</a>
                      </div>
                    ) : null}
                    {errors['personalInfo.resume'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['personalInfo.resume']}</div>
                    ) : null}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-resume' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>Candidate Type <span className="required">*</span></label>
                    <select
                      id="rec_doc_candidateType"
                      className="form-control"
                      value={formData.documents.candidateType}
                      onChange={(e) => handleInputChange("documents", "candidateType", e.target.value)}
                    >
                      <option value="fresher">Fresher</option>
                      <option value="experienced">Experienced</option>
                    </select>
                    {errors['documents.candidateType'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.candidateType']}</div>
                    ) : null}
                  </div>

                  {/* <div className="form-group">
                    <label>Resume (PDF) <span className="required">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileUpload(e, "documents", "resume", { allowed: "pdf" })}
                      required
                    />
                    {formData.documents.resumeName ? (
                      <div className="form-text">Selected: {formData.documents.resumeName}</div>
                    ) : null}
                  </div> */}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-govt-id' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>Aadhar <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_aadhar"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "aadhar", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.aadharName ? (
                      <div className="form-text">Selected: {formData.documents.aadharName}</div>
                    ) : null}
                    {errors['documents.aadhar'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.aadhar']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>PAN <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_pan"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "pan", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.panName ? (
                      <div className="form-text">Selected: {formData.documents.panName}</div>
                    ) : null}
                    {errors['documents.pan'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.pan']}</div>
                    ) : null}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-education' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>10th Certificate & Marksheet <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_edu10th"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "edu10th", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.edu10thName ? (
                      <div className="form-text">Selected: {formData.documents.edu10thName}</div>
                    ) : null}
                    {errors['documents.edu10th'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.edu10th']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>12th/Intermediate Certificate & Marksheet <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_edu12th"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "edu12th", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.edu12thName ? (
                      <div className="form-text">Selected: {formData.documents.edu12thName}</div>
                    ) : null}
                    {errors['documents.edu12th'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.edu12th']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Graduation Degree & Marksheet (all semesters) <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_eduGraduation"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "eduGraduation", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.eduGraduationName ? (
                      <div className="form-text">Selected: {formData.documents.eduGraduationName}</div>
                    ) : null}
                    {errors['documents.eduGraduation'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.eduGraduation']}</div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Post-Graduation (if applicable)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "eduPg", { allowed: "pdfOrImage" })}
                    />
                    {formData.documents.eduPgName ? (
                      <div className="form-text">Selected: {formData.documents.eduPgName}</div>
                    ) : null}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-photos' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>Passport Size Photos <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_passportPhotos"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, "documents", "passportPhotos", { allowed: "image", multiple: true })}
                      required
                    />
                    {formData.documents.passportPhotosName ? (
                      <div className="form-text">Selected: {formData.documents.passportPhotosName}</div>
                    ) : null}
                    {errors['documents.passportPhotos'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.passportPhotos']}</div>
                    ) : null}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-address' && (
                <div className="form-section">
                  <div className="form-group">
                    <label>Address Proof (Aadhar/Voter ID/Driving License) <span className="required">*</span></label>
                    <input
                      type="file"
                      id="rec_doc_addressProof"
                      className="form-control"
                      accept=".pdf,application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "documents", "addressProof", { allowed: "pdfOrImage" })}
                      required
                    />
                    {formData.documents.addressProofName ? (
                      <div className="form-text">Selected: {formData.documents.addressProofName}</div>
                    ) : null}
                    {errors['documents.addressProof'] ? (
                      <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.addressProof']}</div>
                    ) : null}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'doc-bank' && (
  <div className="form-section">
    <div className="form-group">
      <label>Cancelled Cheque / Passbook Copy (for salary processing)</label>
      <input
        type="file"
        id="rec_doc_bankProof"
        className="form-control"
        accept=".pdf,application/pdf,image/*"
        onChange={(e) => handleFileUpload(e, "documents", "bankProof", { allowed: "pdfOrImage" })}
      />
      {formData.documents.bankProofName ? (
        <div className="form-text">Selected: {formData.documents.bankProofName}</div>
      ) : null}
      {errors['documents.bankProof'] ? (
        <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.bankProof']}</div>
      ) : null}
      {/* <small className="form-text text-muted">
        Either upload a cancelled cheque/passbook copy OR fill in the bank details below.
      </small> */}
    </div>

    <div className="form-group">
      <h5>Either upload a cancelled cheque/passbook copy OR fill in the bank details below</h5>
    </div>

    <div className="form-group">
      <label>Account Number</label>
      <input
        type="text"
        id="rec_doc_bankAccountNumber"
        className="form-control"
        value={formData.documents.bankAccountNumber || ''}
        onChange={(e) => handleInputChange("documents", "bankAccountNumber", e.target.value)}
      />
      {errors['documents.bankAccountNumber'] ? (
        <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.bankAccountNumber']}</div>
      ) : null}
    </div>

    <div className="form-group">
      <label>IFSC Code</label>
      <input
        type="text"
        id="rec_doc_bankIfscCode"
        className="form-control"
        value={formData.documents.bankIfscCode || ''}
        onChange={(e) => handleInputChange("documents", "bankIfscCode", e.target.value)}
      />
      {errors['documents.bankIfscCode'] ? (
        <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.bankIfscCode']}</div>
      ) : null}
    </div>

    <div className="form-group">
      <label>Bank Name</label>
      <input
        type="text"
        id="rec_doc_bankName"
        className="form-control"
        value={formData.documents.bankName || ''}
        onChange={(e) => handleInputChange("documents", "bankName", e.target.value)}
      />
      {errors['documents.bankName'] ? (
        <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.bankName']}</div>
      ) : null}
    </div>

    <div className="form-group">
      <label>Branch</label>
      <input
        type="text"
        id="rec_doc_bankBranch"
        className="form-control"
        value={formData.documents.bankBranch || ''}
        onChange={(e) => handleInputChange("documents", "bankBranch", e.target.value)}
      />
      {errors['documents.bankBranch'] ? (
        <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.bankBranch']}</div>
      ) : null}
    </div>

    <div className="form-actions">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (!formData.documents.bankProof && 
              (!formData.documents.bankAccountNumber || 
               !formData.documents.bankIfscCode || 
               !formData.documents.bankName || 
               !formData.documents.bankBranch)) {
            addNotification({
              title: "Incomplete Information",
              message: "Please either upload a cancelled cheque/passbook OR fill in all bank details",
              type: "error",
              ttl: 3000,
            });
            return;
          }
          handleContinue();
        }}
      >
        Continue
      </button>
    </div>
  </div>
)}  

              {activeSubModule.id === 'doc-experienced' && (
                <div className="form-section">
                  {formData.documents.candidateType !== "experienced" ? (
                    <div className="alert alert-success">
                      Experienced documents are not required for fresher candidates.
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Updated Resume <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_updatedResume"
                          className="form-control"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileUpload(e, "documents", "updatedResume", { allowed: "pdf" })}
                          required
                        />
                        {formData.documents.updatedResumeName ? (
                          <div className="form-text">Selected: {formData.documents.updatedResumeName}</div>
                        ) : null}
                        {errors['documents.updatedResume'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.updatedResume']}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Experience Certificates / Relieving Letters <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_experienceCertificates"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "experienceCertificates", { allowed: "pdfOrImage" })}
                          required
                        />
                        {formData.documents.experienceCertificatesName ? (
                          <div className="form-text">Selected: {formData.documents.experienceCertificatesName}</div>
                        ) : null}
                        {errors['documents.experienceCertificates'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.experienceCertificates']}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Last 3 or 6 Months Salary Slips <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_salarySlips"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "salarySlips", { allowed: "pdfOrImage" })}
                          required
                        />
                        {formData.documents.salarySlipsName ? (
                          <div className="form-text">Selected: {formData.documents.salarySlipsName}</div>
                        ) : null}
                        {errors['documents.salarySlips'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.salarySlips']}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Bank Statements (if salary slip unavailable)</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "bankStatements", { allowed: "pdfOrImage" })}
                        />
                        {formData.documents.bankStatementsName ? (
                          <div className="form-text">Selected: {formData.documents.bankStatementsName}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Previous Company Offer Letter <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_previousCompanyOfferLetter"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "previousCompanyOfferLetter", { allowed: "pdfOrImage" })}
                          required
                        />
                        {formData.documents.previousCompanyOfferLetterName ? (
                          <div className="form-text">Selected: {formData.documents.previousCompanyOfferLetterName}</div>
                        ) : null}
                        {errors['documents.previousCompanyOfferLetter'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.previousCompanyOfferLetter']}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Last Working Day Acceptance / Resignation Acceptance <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_lastWorkingDayAcceptance"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "lastWorkingDayAcceptance", { allowed: "pdfOrImage" })}
                          required
                        />
                        {formData.documents.lastWorkingDayAcceptanceName ? (
                          <div className="form-text">Selected: {formData.documents.lastWorkingDayAcceptanceName}</div>
                        ) : null}
                        {errors['documents.lastWorkingDayAcceptance'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.lastWorkingDayAcceptance']}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>Form 16 (optional but preferred)</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "form16", { allowed: "pdfOrImage" })}
                        />
                        {formData.documents.form16Name ? (
                          <div className="form-text">Selected: {formData.documents.form16Name}</div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label>UAN/ESI Details (for PF transfer & compliance) <span className="required">*</span></label>
                        <input
                          type="file"
                          id="rec_doc_uanEsiDetails"
                          className="form-control"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "documents", "uanEsiDetails", { allowed: "pdfOrImage" })}
                          required
                        />
                        {formData.documents.uanEsiDetailsName ? (
                          <div className="form-text">Selected: {formData.documents.uanEsiDetailsName}</div>
                        ) : null}
                        {errors['documents.uanEsiDetails'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['documents.uanEsiDetails']}</div>
                        ) : null}
                      </div>
                    </>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              
              {activeSubModule.id === 'issue-letter' && (
                <div className="form-section">
                  <h4>Issue Offer Letter</h4>
                  <div className="offer-issued-row">
                    <span className="offer-issued-text">Issued?</span>
                    <label className="toggle-switch" htmlFor="issuedCheck">
                      <input
                        type="checkbox"
                        id="issuedCheck"
                        checked={!!formData.offerLetter.issued}
                        onChange={(e) => handleInputChange("offerLetter", "issued", e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  {formData.offerLetter.issued ? (
                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-start', gap: 12, marginTop: 12 }}>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleOfferDecision("accepted")}
                      >
                        Accepted
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleOfferDecision("rejected")}
                      >
                        Rejected
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-info" style={{ marginTop: 12 }}>
                      Mark <strong>Issued?</strong> to enable acceptance/rejection.
                    </div>
                  )}
                </div>
              )}

              {activeSubModule.id === 'track-status' && (
                <div className="form-section">
                  <h4>Track Acceptance Status</h4>
                  <div className="alert alert-secondary">
                    <div><strong>Issued:</strong> {formData.offerLetter.issued ? 'Yes' : 'No'}</div>
                    <div><strong>Status:</strong> {formData.offerLetter.status || 'pending'}</div>
                  </div>
                </div>
              )}

              {activeSubModule.id === 'candidate-dropout' && (
                <div className="form-section">
                  <h4>Candidate Dropout</h4>

                  {/* {formData.offerLetter.status !== 'rejected' ? (
                    <div className="alert alert-warning">
                      Dropout reason is applicable only when the offer is rejected.
                    </div>
                  ) : null} */}

                  <div className="form-group">
                    <label>Reason for Dropout <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={formData.dropout.reason}
                      onChange={(e) => handleInputChange("dropout", "reason", e.target.value)}
                      required
                    >
                      <option value="">Select reason</option>
                      <option value="better_offer">Better offer</option>
                      <option value="personal_reasons">Personal reasons</option>
                      <option value="not_interested">Not interested</option>
                      <option value="joining_delay">Joining date mismatch</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.dropout.remarks}
                      onChange={(e) => handleInputChange("dropout", "remarks", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeSubModule.id === 'joining-form' && (
                <div className="form-section">
                  <h4>Joining Details</h4>
                  {formData.offerLetter.status !== 'accepted' ? (
                    <div className="alert alert-warning">
                      Joining details can be filled only after the offer is accepted.
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Joining Date <span className="required">*</span></label>
                        <input
                          type="date"
                          id="rec_joining_joiningDate"
                          className="form-control"
                          value={formData.joining.joiningDate}
                          onChange={(e) => handleInputChange("joining", "joiningDate", e.target.value)}
                          required
                        />
                        {errors['joining.joiningDate'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['joining.joiningDate']}</div>
                        ) : null}
                      </div>

                      <div className="form-group">
                        <label>Department <span className="required">*</span></label>
                        <input
                          type="text"
                          id="rec_joining_department"
                          className="form-control"
                          value={formData.joining.department}
                          onChange={(e) => handleInputChange("joining", "department", e.target.value)}
                          required
                        />
                        {errors['joining.department'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['joining.department']}</div>
                        ) : null}
                      </div>

                      <div className="form-group">
                        <label>Designation <span className="required">*</span></label>
                        <input
                          type="text"
                          id="rec_joining_designation"
                          className="form-control"
                          value={formData.joining.designation}
                          onChange={(e) => handleInputChange("joining", "designation", e.target.value)}
                          required
                        />
                        {errors['joining.designation'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['joining.designation']}</div>
                        ) : null}
                      </div>

                      <div className="form-group">
                        <label>Reporting Manager<span className="required">*</span></label>
                        <input
                          type="text"
                          id="rec_joining_reportingManager"
                          className="form-control"
                          value={formData.joining.reportingManager}
                          onChange={(e) => handleInputChange("joining", "reportingManager", e.target.value)}
                        />
                        {errors['joining.reportingManager'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['joining.reportingManager']}</div>
                        ) : null}
                      </div>

                      <div className="form-group">
                        <label>Induction<span className="required">*</span></label>
                        <select
                          id="rec_joining_induction"
                          className="form-control"
                          value={formData.joining.induction}
                          onChange={(e) => handleInputChange("joining", "induction", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="yes">Done</option>
                          <option value="no">Not Yet Done</option>
                        </select>
                        {errors['joining.induction'] ? (
                          <div className="form-text" style={{ color: '#dc3545' }}>{errors['joining.induction']}</div>
                        ) : null}
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (!formData.joining.joiningDate || !formData.joining.department || !formData.joining.designation || !formData.joining.reportingManager || !formData.joining.induction) {
                              addNotification({
                                title: 'Incomplete Information',
                                message: getStepValidationMessage(),
                                type: 'error',
                                ttl: 3500,
                              });
                              return;
                            }
                            setModuleAndSubmodule('joining', 'employee-id');
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {activeSubModule.id === 'employee-id' && (
                <div className="form-section">
                  <h4>Employee ID Generation</h4>
                  <div className="alert alert-success">
                    <strong>Employee ID Generated:</strong> {candidateEmpId || '-'}
                  </div>
                  <div className="form-group">
                    <label>Department<span className="required">*</span></label>
                    <select className="form-control">
                      <option>IT</option>
                      <option>HR</option>
                      <option>Finance</option>
                      <option>Operations</option>
                      <option>Sales</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Designation<span className="required">*</span></label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
              )}
              
              {/* Add more submodule content as needed */}

              {(() => {
                const hideFooterFor = new Set([
                  'issue-letter',
                  'basic-details',
                  'doc-resume',
                  'doc-govt-id',
                  'doc-education',
                  'doc-photos',
                  'doc-address',
                  'doc-bank',
                  'doc-experienced',
                  'joining-form',
                ]);
                const shouldShowFooter = !!activeSubModule && !hideFooterFor.has(activeSubModule.id);
                const isFinalSave = activeSubModule?.id === 'employee-id' || activeSubModule?.id === 'candidate-dropout';
                if (!shouldShowFooter) return null;
                return (
                  <div className="form-actions">
                    {isFinalSave ? (
                      <button type="button" className="btn btn-primary" onClick={handleSave}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={handleContinue}>
                        Continue
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={handleBack}>
                      Back
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="submodule-list">
            <h3>Select a submodule</h3>
            <div className="submodule-grid">
              {activeModule.subModules.map((subModule) => (
                <div 
                  key={subModule.id} 
                  className="submodule-card"
                  onClick={() => handleSubModuleClick(subModule)}
                >
                  <div className="submodule-icon">
                    {getSubModuleIcon(subModule.id)}
                  </div>
                  <div className="submodule-name">{subModule.name}</div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-secondary back-button"
              onClick={() => setActiveModule(null)}
            >
              Back to Modules
            </button>
          </div>
        )}
      </div>
    );
  };

  const getSubModuleIcon = (subModuleId) => {
    switch(subModuleId) {
      case 'basic-details':
        return <i className="fas fa-user"></i>;
      case 'doc-resume':
        return <i className="fas fa-file-pdf"></i>;
      case 'doc-govt-id':
        return <i className="fas fa-id-card"></i>;
      case 'doc-education':
        return <i className="fas fa-graduation-cap"></i>;
      case 'doc-photos':
        return <i className="fas fa-camera"></i>;
      case 'doc-address':
        return <i className="fas fa-map-marker-alt"></i>;
      case 'doc-bank':
        return <i className="fas fa-university"></i>;
      case 'doc-experienced':
        return <i className="fas fa-briefcase"></i>;
      case 'issue-letter':
        return <i className="fas fa-file-contract"></i>;
      case 'employee-id':
        return <i className="fas fa-id-card"></i>;
      default:
        return <i className="fas fa-folder"></i>;
    }
  };

  const getModuleIcon = (moduleId) => {
    switch (moduleId) {
      case "personal":
        return <i className="fas fa-user-tie"></i>;
      case "education":
        return <i className="fas fa-graduation-cap"></i>;
      case "documents":
        return <i className="fas fa-file-alt"></i>;
      case "offer-letter":
        return <i className="fas fa-file-signature"></i>;
      case "joining":
        return <i className="fas fa-user-plus"></i>;
      default:
        return <i className="fas fa-folder"></i>;
    }
  };

  return (
    <div className="recruitment-container">
      <div className="dashboard-header">
        <div>
          <h2>👥 Recruitment Module</h2>
          <p>Manage the complete recruitment and onboarding process</p>
        </div>
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search candidate..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="candidate-selector">
            <select 
              className="form-control" 
              value={candidateName}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'new') {
                  startNewCandidate();
                  return;
                }
                syncCandidateSelection(v);
              }}
            >
              <option value="">Select Candidate</option>
              <option value="new">+ Add New Candidate</option>
              {(candidates || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="recruitment-layout">
        <div className="module-sidebar">
          <h3>Recruitment Modules</h3>
          <ul className="module-list">
            {modules.map((module) => (
              (() => {
                const isModuleLocked = module.id === 'joining' && !isJoiningUnlocked;
                return (
              <li 
                key={module.id}
                className={`module-item ${activeModule?.id === module.id ? 'active' : ''} ${isModuleLocked ? 'disabled' : ''}`}
                style={isModuleLocked ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                onClick={() => handleModuleClick(module)}
              >
                <div className="module-header">
                  <span className="module-icon">
                    {getModuleIcon(module.id)}
                  </span>
                  <span className="module-name">{module.name}</span>
                  <span className="module-arrow">
                    <i className={`fas fa-chevron-${activeModule?.id === module.id ? 'up' : 'down'}`}></i>
                  </span>
                </div>
                {activeModule?.id === module.id && (
                  <ul className="submodule-list">
                    {module.subModules.map((subModule) => (
                      (() => {
                        const isSubLocked = module.id === 'joining' && !isJoiningUnlocked;
                        return (
                      <li 
                        key={subModule.id}
                        className={`submodule-item ${activeSubModule?.id === subModule.id ? 'active' : ''} ${isSubLocked ? 'disabled' : ''}`}
                        style={isSubLocked ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubModuleClick(subModule);
                        }}
                      >
                        {subModule.name}
                      </li>
                        );
                      })()
                    ))}
                  </ul>
                )}
              </li>
                );
              })()
            ))}
          </ul>
        </div>

        <div className="module-content-wrapper">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
