// Schemas/Types used for swagger documentation.
// Shouldn't affect code in anyway.

/**
 * @swagger
 * components:
 *   schemas:
 *     JsonResponseNoData:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           description: A message about the response
 *         success:
 *           type: boolean
 *           description: Whether the request succeeded or not
 *       example:
 *         msg: Success!
 *         success: true
 *     JsonResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           description: A message about the response
 *         success:
 *           type: boolean
 *           description: Whether the request succeeded or not
 *         data:
 *           type: object
 *           description: The response body
 *       example:
 *         msg: Success!
 *         success: true
 */
