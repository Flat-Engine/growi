import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:revision');

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Revision:
 *        description: Revision
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: revision ID
 *            example: 5e0734e472560e001761fa68
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          author:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          body:
 *            type: string
 *            description: content body
 *            example: |
 *              # test
 *
 *              test
 *          format:
 *            type: string
 *            description: format
 *            example: markdown
 *          path:
 *            type: string
 *            description: path
 *            example: /user/alice/test
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = function(crowi, app) {
  const Page = crowi.model('Page');
  const Revision = crowi.model('Revision');
  const User = crowi.model('User');
  const ApiResponse = require('../util/apiResponse');

  const actions = {};
  actions.api = {};

  /**
   * @swagger
   *
   *    /revisions.get:
   *      get:
   *        tags: [Revisions, CrowiCompatibles]
   *        operationId: revisions.get
   *        summary: /revisions.get
   *        description: Get revision
   *        parameters:
   *          - in: query
   *            name: page_id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *            required: true
   *          - in: query
   *            name: revision_id
   *            schema:
   *              $ref: '#/components/schemas/Revision/properties/_id'
   *            required: true
   *        responses:
   *          200:
   *            description: Succeeded to get revision.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    revision:
   *                      $ref: '#/components/schemas/Revision'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /revisions.get Get revision
   * @apiName GetRevision
   * @apiGroup Revision
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   */
  actions.api.get = async function(req, res) {
    const pageId = req.query.page_id;
    const revisionId = req.query.revision_id;
    const { isSharedPage } = req;

    if (!pageId || !revisionId) {
      return res.json(ApiResponse.error('Parameter page_id and revision_id are required.'));
    }

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    try {
      const revision = await Revision.findById(revisionId).populate('author', User.USER_PUBLIC_FIELDS);
      return res.json(ApiResponse.success({ revision }));
    }
    catch (err) {
      logger.error('Error revisios.get', err);
      return res.json(ApiResponse.error(err));
    }
  };

  /**
   * @swagger
   *
   *    /revisions.ids:
   *      get:
   *        tags: [Revisions, CrowiCompatibles]
   *        operationId: revisions.ids
   *        summary: /revisions.ids
   *        description: Get revision id list of the page
   *        parameters:
   *          - in: query
   *            name: page_id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *            required: true
   *        responses:
   *          200:
   *            description: Succeeded to get revision id list of the page.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    revisions:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/Revision'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /revisions.ids Get revision id list of the page
   * @apiName ids
   * @apiGroup Revision
   *
   * @apiParam {String} page_id      Page Id.
   */
  actions.api.ids = async function(req, res) {
    const pageId = req.query.page_id;
    const { isSharedPage } = req;

    if (pageId == null) {
      return res.json(ApiResponse.error('Parameter page_id is required.'));
    }

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.json(ApiResponse.error('Current user is not accessible to this page.'));
    }

    try {
      const page = await Page.findOne({ _id: pageId });
      const revisions = await Revision.findRevisionIdList(page.path);
      return res.json(ApiResponse.success({ revisions }));
    }
    catch (err) {
      logger.error('Error revisios.ids', err);
      return res.json(ApiResponse.error(err));
    }
  };

  return actions;
};
