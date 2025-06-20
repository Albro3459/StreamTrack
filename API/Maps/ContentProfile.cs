using AutoMapper;

using API.Models;
using API.DTOs;

public class ContentProfile : Profile {
    public ContentProfile() {
        CreateMap<Content, ContentDTO>().ReverseMap();

        CreateMap<Genre, GenreDTO>().ReverseMap();
    }
}