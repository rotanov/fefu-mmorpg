#pragma once

#include <streambuf>
#include <vector>
#include <string>

#include <QPlainTextEdit>
#include <QByteArray>

class DebugStream : public std::basic_streambuf<char>
{
public:
    DebugStream(std::ostream& stream, QPlainTextEdit* text_edit);
    virtual ~DebugStream();

protected:
    virtual int_type overflow(int_type v);
    virtual std::streamsize xsputn(const char* p, std::streamsize n);

private:
    std::ostream& stream_;
    std::streambuf* oldBuffer_;
    std::string string_;
    QPlainTextEdit* logWindow_;
};

class BufferStream : public std::basic_streambuf<char>
{
public:
    BufferStream(std::ostream& stream, QByteArray& buffer);

    virtual ~BufferStream();

protected:
    virtual int_type overflow(int_type v);
    virtual std::streamsize xsputn(const char* p, std::streamsize n);

private:
    std::ostream& stream_;
    std::streambuf* oldBuffer_;
    QByteArray& outputBuffer_;
};
