/**
 * @name User
 * @type {{
 *     id: Number,
 *     email: String,
 *     balance: Number,
 *     executedTasksForDay: Number,
 *     executedTasksForWeek: Number,
 *     executedTasksForMonth: Number,
 *     discount: Number,
 *     maxResourceLimit: Number,
 *     loadLimit: Number,
 *     accountCreatedAt: Date,
 * }}
 */

/**
 * @name Project
 * @type {{
 *     id: Number,
 *     userId: Number,
 *     siteAddress: String,
 *     searchEngine: String,
 *     searchingRange: "100" | "200",
 *     parsingTime: Date,
 *     parsingDays: String,
 *     queriesCount: Number,
 * }}
 */

/**
 * @name Group
 * @type {{
 *     id: Number,
 *     projectId: Number,
 *     groupName: String,
 *     queriesCount: Number
 * }}
 */
/**
 * @name Subgroup
 * @type {{
 *     id: Number,
 *     groupId: Number,
 *     subgroupName: String,
 *     queriesCount: Number
 * }}
 */
/**
 * @name City
 * @type {{
 *     id: Number,
 *     projectId: Number,
 *     cityName: String,
 * }}
 */

/**
 * @name SearchingQuery
 * @type {{
 *     id: Number,
 *     groupId: Number,
 *     queryText: String,
 * }}
 */

/**
 * @name Position
 * @type {{
 *     id: Number,
 *     queryId: Number,
 *     subgroupId: Number,
 *     place: Number,
 *     lastCollection: Date,
 *     queryText: String,
 *     cityCollection: String,
 *     groupId: Number,
 *     projectId: Number,
 *     engineCollection: String,
 *     foundAddress: String
 * }}
 */
