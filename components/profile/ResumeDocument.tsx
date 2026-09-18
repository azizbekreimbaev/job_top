import "server-only";

import {
  Document,
  Line,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

import { getCompleteResumeRoles, MAX_RESUME_SKILLS } from "@/lib/resume";
import { isCompleteEducation } from "@/lib/profile";
import type {
  Education,
  GeneratedResumeContent,
  ProfileFormValues,
} from "@/types/profile";

const PDF_COLORS = {
  accent: "rgb(124, 92, 252)",
  primary: "rgb(16, 24, 40)",
  secondary: "rgb(75, 85, 99)",
  muted: "rgb(107, 114, 128)",
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontFamily: "Helvetica",
    color: PDF_COLORS.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  currentTitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 700,
    color: PDF_COLORS.accent,
  },
  contact: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 1.35,
    color: PDF_COLORS.secondary,
  },
  rule: {
    marginTop: 10,
    marginBottom: 9,
    width: "100%",
    height: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeading: {
    marginBottom: 4,
    fontSize: 9,
    fontWeight: 700,
    color: PDF_COLORS.accent,
  },
  body: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: PDF_COLORS.primary,
  },
  skills: {
    fontSize: 8.2,
    lineHeight: 1.35,
    color: PDF_COLORS.secondary,
  },
  role: {
    marginBottom: 6,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roleIdentity: {
    width: "72%",
  },
  roleTitle: {
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  company: {
    marginTop: 1,
    fontSize: 8.2,
    color: PDF_COLORS.secondary,
  },
  dates: {
    width: "28%",
    fontSize: 7.8,
    textAlign: "right",
    color: PDF_COLORS.muted,
  },
  bullet: {
    marginTop: 2,
    fontSize: 8.1,
    lineHeight: 1.3,
    color: PDF_COLORS.primary,
  },
  educationTitle: {
    fontSize: 8.7,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  educationEntry: {
    marginBottom: 4,
  },
  educationDetail: {
    marginTop: 1,
    fontSize: 8,
    color: PDF_COLORS.secondary,
  },
});

const DEGREE_LABELS: Record<string, string> = {
  "high-school": "High School",
  associate: "Associate Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  doctorate: "Doctorate",
};

type ResumeDocumentProps = {
  profile: ProfileFormValues;
  content: GeneratedResumeContent;
};

function formatEducation(education: Education): {
  title: string;
  detail: string;
} | null {
  const degree = DEGREE_LABELS[education.degree] ?? education.degree;
  const title = [degree, education.fieldOfStudy].filter(Boolean).join(" in ");
  const detail = [education.institution, education.graduationYear]
    .filter(Boolean)
    .join(" | ");

  return title || detail ? { title, detail } : null;
}

function truncateText(value: string, maximumCharacters: number): string {
  if (value.length <= maximumCharacters) {
    return value;
  }
  return `${value.slice(0, maximumCharacters - 3).trimEnd()}...`;
}

export function ResumeDocument({ profile, content }: ResumeDocumentProps) {
  const contact = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedinUrl,
    profile.portfolioUrl,
  ].filter(Boolean).map((value) => truncateText(value, 64));
  const roles = getCompleteResumeRoles(profile);
  const education = profile.education
    .filter(isCompleteEducation)
    .map(formatEducation)
    .filter((entry): entry is { title: string; detail: string } => Boolean(entry));

  return (
    <Document
      title={`${profile.fullName} Resume`}
      author={profile.fullName}
      subject={`${profile.currentTitle} professional resume`}
      creator="JobPilot"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{truncateText(profile.fullName, 80)}</Text>
        <Text style={styles.currentTitle}>
          {truncateText(profile.currentTitle, 100)}
        </Text>
        <Text style={styles.contact}>{contact.join(" | ")}</Text>
        <Svg style={styles.rule} viewBox="0 0 527 1">
          <Line
            x1="0"
            y1="0.5"
            x2="527"
            y2="0.5"
            stroke={PDF_COLORS.accent}
            strokeWidth="1"
          />
        </Svg>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.body}>{content.professionalSummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>SKILLS</Text>
          <Text style={styles.skills}>
            {profile.skills.slice(0, MAX_RESUME_SKILLS).join(" | ")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>WORK EXPERIENCE</Text>
          {content.roles.map((generatedRole) => {
            const role = roles[generatedRole.roleIndex];
            const endDate = role.currentlyWorking
              ? "Present"
              : role.endDate;
            const dates = [role.startDate, endDate].filter(Boolean).join(" - ");

            return (
              <View key={generatedRole.roleIndex} style={styles.role}>
                <View style={styles.roleHeader}>
                  <View style={styles.roleIdentity}>
                    <Text style={styles.roleTitle}>
                      {truncateText(role.title, 90)}
                    </Text>
                    <Text style={styles.company}>
                      {truncateText(role.company, 90)}
                    </Text>
                  </View>
                  <Text style={styles.dates}>{truncateText(dates, 50)}</Text>
                </View>
                {generatedRole.bulletPoints.map((bullet) => (
                  <Text key={bullet} style={styles.bullet}>
                    - {bullet}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>

        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>EDUCATION</Text>
            {education.map((entry, index) => (
              <View key={`${entry.title}-${entry.detail}-${index}`} style={styles.educationEntry}>
                {entry.title ? (
                  <Text style={styles.educationTitle}>
                    {truncateText(entry.title, 120)}
                  </Text>
                ) : null}
                {entry.detail ? (
                  <Text style={styles.educationDetail}>
                    {truncateText(entry.detail, 140)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
