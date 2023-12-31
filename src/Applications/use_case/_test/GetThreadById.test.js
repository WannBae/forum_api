const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const GetThreadUseCase = require("../../use_case/GetThreadById");

describe("GetThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedThread = {
      id: "thread-123",
      title: "ini adalah judul thread",
      body: "ini adalah isi thread",
      date: "2023",
      username: "dicoding",
    };

    const expectedComments = [
      {
        id: "comment-123",
        username: "dicoding",
        date: "2023",
        content: "ini adalah isi komentar",
        is_deleted: false,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-123",
        content: "ini adalah isi balasan",
        date: "2023",
        username: "jhon",
        comment_id: "comment-123",
        is_deleted: false,
      },
    ];

    const mappedComments = expectedComments.map(
      ({ is_deleted: deletedComment, ...otherProperties }) => otherProperties
    );
    const mappedReplies = expectedReplies.map(
      ({ comment_id, is_deleted, ...otherProperties }) => otherProperties
    );

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => expectedThread);

    mockCommentRepository.getCommentsByThreadId = jest.fn(
      () => expectedComments
    );
    mockThreadRepository.getRepliesByThreadId = jest.fn(() => expectedReplies);

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const theThread = await mockGetThreadUseCase.execute(
      useCasePayload.threadId
    );

    // Assert
    expect(theThread).toStrictEqual({
      ...expectedThread,
      comments: expectedCommentsAndReplies,
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );

    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
  });

  it("should not display deleted comment", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const expectedThread = {
      id: "thread-123",
      title: "ini adalah judul thread",
      body: "ini adalah isi thread",
      date: "2023",
      username: "dicoding",
    };

    const expectedComments = [
      {
        id: "comment-123",
        username: "dicoding",
        date: "2023",
        content: "**komentar telah dihapus**",
        is_deleted: true,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-123",
        content: "**balasan telah dihapus**",
        date: "2023",
        username: "jhon",
        comment_id: "comment-123",
        is_deleted: true,
      },
    ];

    const mappedComments = expectedComments.map(
      ({ is_deleted: deletedComment, ...otherProperties }) => otherProperties
    );
    const mappedReplies = expectedReplies.map(
      ({ comment_id, is_deleted, ...otherProperties }) => otherProperties
    );

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => expectedThread);

    mockCommentRepository.getCommentsByThreadId = jest.fn(
      () => expectedComments
    );

    mockThreadRepository.getRepliesByThreadId = jest.fn(() => expectedReplies);

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const theThread = await mockGetThreadUseCase.execute(
      useCasePayload.threadId
    );

    // Assert
    expect(theThread).toStrictEqual({
      ...expectedThread,
      comments: expectedCommentsAndReplies,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(
      useCasePayload.threadId
    );
  });
});
