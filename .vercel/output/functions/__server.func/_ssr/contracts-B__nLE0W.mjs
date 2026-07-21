import { c as objectType, d as unknownType, i as arrayType, l as recordType, o as enumType, s as numberType, u as stringType } from "../_libs/openai+zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contracts-B__nLE0W.js
/** Adds the secure default protocol without changing an explicitly supplied URL. */
function normalizeWebsiteUrl(value) {
	const trimmed = value.trim();
	return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
var analysisStatusSchema = enumType([
	"queued",
	"running",
	"completed",
	"failed"
]);
var analysisIdSchema = stringType().uuid();
var analyzeRequestSchema = objectType({ url: stringType().trim().transform(normalizeWebsiteUrl).pipe(stringType().url()).refine((value) => {
	try {
		return ["http:", "https:"].includes(new URL(value).protocol);
	} catch {
		return false;
	}
}, "URL must use HTTP or HTTPS") });
var analyzeResponseSchema = objectType({
	analysisId: analysisIdSchema,
	status: analysisStatusSchema,
	overallScore: numberType().int().min(0).max(100),
	scores: objectType({
		performance: numberType().int(),
		seo: numberType().int(),
		accessibility: numberType().int(),
		security: numberType().int(),
		mobile: numberType().int(),
		ux: numberType().int()
	})
});
var reportParamsSchema = objectType({ id: analysisIdSchema });
var analysisSchema = objectType({
	id: analysisIdSchema,
	site_id: stringType().uuid(),
	status: analysisStatusSchema,
	overall_score: numberType().int().nullable(),
	seo_score: numberType().int().nullable(),
	performance_score: numberType().int().nullable(),
	accessibility_score: numberType().int().nullable(),
	security_score: numberType().int().nullable(),
	mobile_score: numberType().int().nullable(),
	ux_score: numberType().int().nullable(),
	executive_summary: stringType().nullable(),
	ai_content: recordType(unknownType()).nullable(),
	ai_generated_at: stringType().nullable(),
	ai_prompt_version: stringType().nullable(),
	created_at: stringType()
});
var issueSchema = objectType({
	id: stringType().uuid(),
	analysis_id: analysisIdSchema,
	category: stringType(),
	severity: enumType([
		"critical",
		"high",
		"medium",
		"low",
		"info"
	]),
	title: stringType(),
	description: stringType(),
	recommendation: stringType(),
	estimated_fix_time: stringType(),
	ai_explanation: recordType(unknownType()).nullable()
});
var recommendationRecordSchema = objectType({
	id: stringType().uuid(),
	analysis_id: analysisIdSchema,
	priority: numberType().int().positive(),
	title: stringType(),
	description: stringType(),
	expected_impact: stringType()
});
var reportResponseSchema = objectType({
	analysis: analysisSchema,
	site: objectType({
		id: stringType().uuid(),
		url: stringType().url(),
		domain: stringType()
	}),
	issues: arrayType(issueSchema),
	recommendations: arrayType(recommendationRecordSchema)
});
//#endregion
export { normalizeWebsiteUrl as a, analyzeResponseSchema as i, analysisSchema as n, reportParamsSchema as o, analyzeRequestSchema as r, reportResponseSchema as s, analysisIdSchema as t };
